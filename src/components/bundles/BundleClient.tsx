'use client'

import { useState, useMemo } from 'react'
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

interface BundleClientProps {
  products: Product[]
  bundle: {
    name: string
    description: string
    requiredQuantity: number
    discountPercentage: number
  }
}

export function BundleClient({ products, bundle }: BundleClientProps) {
  const { cart, addItem, updateQuantity } = useCart()
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})

  const selectedCount = useMemo(() => {
    return Object.values(localQuantities).reduce((sum, qty) => sum + qty, 0)
  }, [localQuantities])

  const isQualified = selectedCount >= bundle.requiredQuantity

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const currentQty = localQuantities[productId] || 0
    const newQty = Math.max(0, currentQty + delta)
    
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }))
  }

  const handleAddToCart = () => {
    Object.entries(localQuantities).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const product = products.find(p => p._id === productId)
        if (product) {
          const cartItem = cart.items.find(item => String(item.product._id) === productId)
          if (cartItem) {
            updateQuantity(productId, cartItem.quantity + quantity)
          } else {
            addItem(product as any, quantity)
          }
        }
      }
    })
    
    // Reset local quantities
    setLocalQuantities({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Bundle Status Banner */}
      <div className={`mb-8 p-6 rounded-lg ${isQualified ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border-2 border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isQualified ? '🎉 Bundle Complete!' : `Select ${bundle.requiredQuantity - selectedCount} more item${bundle.requiredQuantity - selectedCount !== 1 ? 's' : ''}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {isQualified 
                ? `You've selected ${selectedCount} items. Your ${bundle.discountPercentage}% discount will be applied at checkout!`
                : `You've selected ${selectedCount} of ${bundle.requiredQuantity} required items.`
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{bundle.discountPercentage}% OFF</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const qty = localQuantities[product._id] || 0
          
          return (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                {product.images && product.images.length > 0 ? (
                  <OptimizedImage
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">No Image</p>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(product._id, -1)}
                      disabled={qty === 0}
                      className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-semibold min-w-[2rem] text-center">{qty}</span>
                    <button
                      onClick={() => handleUpdateQuantity(product._id, 1)}
                      disabled={product.inventory <= 0}
                      className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {product.inventory <= 0 && (
                  <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add to Cart Button */}
      {selectedCount > 0 && (
        <div className="mt-8 sticky bottom-4 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="h-6 w-6" />
            Add {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Cart
            {isQualified && ` (${bundle.discountPercentage}% OFF)`}
          </button>
        </div>
      )}
    </div>
  )
}

