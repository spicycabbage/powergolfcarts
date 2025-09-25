'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Minus, Plus } from 'lucide-react'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice: number
  images: string[]
  inventory: number
  sku: string
}

interface Bundle {
  name: string
  description: string
  requiredQuantity: number
  discountPercentage: number
  skuFilter: string
}

interface BundleProductsResponse {
  products: Product[]
  totalCount: number
  bundle: Bundle
}

export default function BundlePage() {
  const params = useParams()
  const slug = params.slug as string
  const { cart, addItem, updateQuantity } = useCart()

  const [data, setData] = useState<BundleProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBundleProducts()
  }, [slug, search])

  const fetchBundleProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search })
      })
      
      const response = await fetch(`/api/bundles/${slug}/products?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bundle products')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching bundle products:', error)
      setError('Failed to load bundle products')
    } finally {
      setLoading(false)
    }
  }

  // Calculate bundle progress - memoized to prevent reflows
  const bundleProgress = useMemo(() => {
    if (!data?.bundle) return { count: 0, items: [], regularPrice: 0, discountedPrice: 0 }
    
    // Only count items that match this specific bundle's SKU filter
    const bundleItems = cart.items.filter(item => {
      const sku = item.variant?.sku || item.product.inventory?.sku || ''
      return sku.includes(data.bundle.skuFilter)
    })
    
    const totalCount = bundleItems.reduce((sum, item) => sum + item.quantity, 0)
    const regularPrice = bundleItems.reduce((sum, item) => sum + ((item.variant?.price || item.product.price) * item.quantity), 0)
    const discountedPrice = totalCount >= data.bundle.requiredQuantity 
      ? regularPrice * (1 - data.bundle.discountPercentage / 100)
      : regularPrice
    
    return {
      count: totalCount,
      items: bundleItems,
      regularPrice,
      discountedPrice
    }
  }, [cart.items, data?.bundle])

  const getProductQuantityInCart = (product: Product) => {
    // Use the same SKU-based matching as bundleProgress for consistency
    const productSku = product.sku
    if (!productSku || !data?.bundle?.skuFilter) return 0
    
    // Only count if this product matches the bundle's SKU filter
    if (!productSku.includes(data.bundle.skuFilter)) return 0
    
    // Find all cart items that match this specific product's SKU
    const matchingItems = cart.items.filter(item => {
      const itemSku = item.variant?.sku || item.product.inventory?.sku || ''
      return itemSku === productSku
    })
    
    // Return total quantity for this specific product SKU
    return matchingItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleAddToCart = (product: Product) => {
    // Convert to the format expected by the existing cart system
    const productForCart = {
      ...product,
      images: product.images.map((img, idx) => ({
        _id: idx.toString(),
        url: typeof img === 'string' ? img : (img as any)?.url || '',
        alt: product.name,
        width: 800,
        height: 800,
        isPrimary: idx === 0
      })),
      inventory: {
        quantity: product.inventory,
        lowStockThreshold: 5,
        sku: product.sku,
        trackInventory: true
      },
      category: { _id: '', name: '', slug: '' },
      categories: [],
      tags: [],
      seo: { title: '', description: '', keywords: [] },
      variants: [],
      reviews: [],
      averageRating: 0,
      reviewCount: 0,
      isActive: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: '',
      shortDescription: '',
      // Add bundle metadata
      bundleType: slug
    }
    
    // Create the variant object for the specific bundle variant
    const variant = {
      _id: (product as any).variantId, // Should always be set by the API now
      sku: product.sku,
      name: 'Weight',
      value: bundle.name.includes('28g') ? '28g' : '7g',
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      inventory: product.inventory
    }
    
    addItem(productForCart as any, 1, variant)
  }

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    // Find cart item by SKU instead of variant ID to handle cross-page compatibility
    const productSku = product.sku
    const cartItem = cart.items.find(item => {
      const itemSku = item.variant?.sku || item.product.inventory?.sku || ''
      return itemSku === productSku
    })
    
    if (cartItem) {
      if (newQuantity === 0) {
        updateQuantity(cartItem.product._id, 0, cartItem.variant)
      } else {
        updateQuantity(cartItem.product._id, newQuantity, cartItem.variant)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Bundle not found'}</p>
          <Link href="/bundles" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Bundles
          </Link>
        </div>
      </div>
    )
  }

  const { products, bundle } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Products ({bundleProgress.count}/4)</h1>
          <p className="text-gray-600">{bundle.description}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Products (3/4 width) */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {products.map((product, index) => {
                const quantityInCart = getProductQuantityInCart(product)
                const isOutOfStock = product.inventory <= 0
                const isAboveFold = index < 4 // First 4 products are likely above the fold
                
                return (
                  <div key={product._id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                    quantityInCart > 0 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200'
                  }`}>
                    {/* Mobile Layout - Stack vertically */}
                    <div className="block sm:hidden">
                      {/* Product Image */}
                      <div className="w-full h-32 bg-gray-200 relative overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <OptimizedImage
                            src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any)?.url || ''}
                            alt={product.name}
                            width={200}
                            height={128}
                            className="w-full h-full object-cover transform-gpu"
                            priority={isAboveFold}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        {/* Quantity Badge */}
                        {quantityInCart > 0 && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {quantityInCart}
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 text-sm">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}/{bundle.name.includes('7g') ? '7g' : '28g'}
                          </div>
                          
                          {/* Add Button or Quantity Controls */}
                          <div>
                            {!isOutOfStock && (
                              <>
                                {quantityInCart === 0 ? (
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  >
                                    Add
                                  </button>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleUpdateQuantity(product, quantityInCart - 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-red-600"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-medium text-sm">{quantityInCart}</span>
                                    <button
                                      onClick={() => handleUpdateQuantity(product, quantityInCart + 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-green-600"
                                      disabled={quantityInCart >= product.inventory}
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                            {isOutOfStock && (
                              <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden sm:flex">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0 relative overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <OptimizedImage
                            src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any)?.url || ''}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover transform-gpu"
                            priority={isAboveFold}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        {/* Quantity Badge */}
                        {quantityInCart > 0 && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {quantityInCart}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1 text-sm">
                            {product.name}
                          </h3>
                          <div className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}/{bundle.name.includes('7g') ? '7g' : '28g'}
                          </div>
                        </div>

                        {/* Add Button or Quantity Controls */}
                        <div className="ml-4">
                          {!isOutOfStock && (
                            <>
                              {quantityInCart === 0 ? (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  Add
                                </button>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(product, quantityInCart - 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-red-600"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center font-medium text-sm">{quantityInCart}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(product, quantityInCart + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-green-600"
                                    disabled={quantityInCart >= product.inventory}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          {isOutOfStock && (
                            <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Show total count */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing all {products.length} products
            </div>
          </div>

          {/* Right Column - Bundle Summary Sidebar (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Summary</h3>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{bundleProgress.count}/4 items</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((bundleProgress.count / bundle.requiredQuantity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Selected Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Items:</h4>
                {bundleProgress.items.length > 0 ? (
                  <div className="space-y-2">
                    {bundleProgress.items.map((item, index) => (
                        <div key={`bundle-item-${index}`} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{item.quantity}x {item.product.name}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, 0, item.variant)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No items selected</p>
                )}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 mb-4">
                {(() => {
                  const regularPrice = bundleProgress.items.reduce((sum, item) => sum + ((item.variant?.price || item.product.price) * item.quantity), 0)
                  const isDiscountActive = bundleProgress.count >= bundle.requiredQuantity
                  const discountAmount = isDiscountActive ? (regularPrice * bundle.discountPercentage / 100) : 0
                  const finalPrice = regularPrice - discountAmount
                  
                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Regular Price:</span>
                        <span>${regularPrice.toFixed(2)}</span>
                      </div>
                      
                      {isDiscountActive && (
                        <>
                          <div className="flex justify-between text-sm text-green-600 mb-1">
                            <span>Bundle Discount ({bundle.discountPercentage}%):</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg text-green-700 border-t pt-2">
                            <span>Bundle Price:</span>
                            <span>${finalPrice.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            You save ${discountAmount.toFixed(2)}!
                          </div>
                        </>
                      )}
                      
                      {!isDiscountActive && bundleProgress.count > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          Add {bundle.requiredQuantity - bundleProgress.count} more items to save {bundle.discountPercentage}% (${(regularPrice * bundle.discountPercentage / 100).toFixed(2)})
                        </div>
                      )}
                      
                      {bundleProgress.count === 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          Bundle discount will be applied automatically at checkout
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Status Messages */}
              {bundleProgress.count >= bundle.requiredQuantity && (
                <div className="p-3 bg-green-100 rounded-lg text-green-800 text-sm font-medium mb-4">
                  ✅ Bundle discount active! Save {bundle.discountPercentage}%
                </div>
              )}
              
              {bundleProgress.count < bundle.requiredQuantity && bundleProgress.count > 0 && (
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-800 text-sm mb-4">
                  Select {bundle.requiredQuantity - bundleProgress.count} more items to get {bundle.discountPercentage}% off
                </div>
              )}

              {bundleProgress.count === 0 && (
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
                  Select 4 items to activate bundle discount
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}