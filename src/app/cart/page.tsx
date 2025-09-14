'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, X } from 'lucide-react'

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [shippingConfig, setShippingConfig] = useState<{ methods: Array<{ name: string, price: number, freeThreshold?: number, sortOrder?: number, isActive?: boolean }> } | null>(null)
  const [selectedShippingKey, setSelectedShippingKey] = useState<string>('')
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleQuantityChange = async (productId: string, newQuantity: number, variant?: any) => {
    if (newQuantity < 1) return
    
    setIsUpdating(productId)
    try {
      updateQuantity(productId, newQuantity, variant)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string, variant?: any) => {
    setIsUpdating(productId)
    try {
      removeItem(productId, variant)
      // Force re-render by updating state
      setTimeout(() => setIsUpdating(null), 100)
    } catch (error) {
      console.error('Error removing item:', error)
      setIsUpdating(null)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setIsApplyingCoupon(true)
    setCouponError('')
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartItems: cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: (item as any)?.variant?.price ?? item.product.price
          }))
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAppliedCoupon(data.data)
        setCouponCode('')
        setCouponError('')
      } else {
        setCouponError(data.error || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponError('Failed to apply coupon. Please try again.')
      setAppliedCoupon(null)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const subtotal = cart.items.reduce((total, item) => {
    const unit = (item as any)?.variant?.price ?? item.product.price
    return total + (unit * item.quantity)
  }, 0)
  const tax = 0

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/shipping', { cache: 'no-store' })
        const json = await res.json().catch(() => ({} as any))
        const data = json?.data
        const activeMethods = (Array.isArray(data?.methods) ? data.methods : []).filter((m: any) => m?.isActive !== false)
        setShippingConfig({
          methods: activeMethods.map((m: any) => ({
            name: String(m.name || 'Method'),
            price: Number(m.price || 0),
            freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : undefined,
            sortOrder: m.sortOrder != null ? Number(m.sortOrder) : undefined,
            isActive: m.isActive !== false,
          }))
        })
      } catch {}
    })()
  }, [])

  const shippingOptions = useMemo(() => {
    const keyFromName = (n: string) => n.toLowerCase().trim().replace(/\s+/g, '-')
    const methods = (shippingConfig?.methods || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.price - b.price)
    const opts: Array<{ key: string, label: string, price: number }> = []
    methods.forEach((m) => {
      const nameKey = keyFromName(m.name)
      const hasPerMethodThreshold = m.freeThreshold != null && !Number.isNaN(Number(m.freeThreshold))
      const canadaPostName = /canada\s*post/i.test(m.name)
      const qualifiesPerMethod = hasPerMethodThreshold && subtotal >= Number(m.freeThreshold)
      const qualifiesCanadaPostDefault = !hasPerMethodThreshold && canadaPostName && subtotal >= 175
      const isFree = qualifiesPerMethod || qualifiesCanadaPostDefault
      const price = isFree ? 0 : m.price
      opts.push({ key: nameKey, label: m.name, price })
    })
    return opts
  }, [shippingConfig, subtotal])

  useEffect(() => {
    if (shippingOptions.length === 0) return
    // Select cheapest (0 first). If current selection not present, reset.
    const cheapest = shippingOptions.reduce((min, cur) => (cur.price < min.price ? cur : min), shippingOptions[0])
    setSelectedShippingKey(prev => (prev && shippingOptions.some(o => o.key === prev)) ? prev : cheapest.key)
  }, [shippingOptions])

  const selectedShipping = useMemo(() => shippingOptions.find(o => o.key === selectedShippingKey) || shippingOptions[0], [shippingOptions, selectedShippingKey])
  const computedShippingCost = selectedShipping ? selectedShipping.price : 0
  
  // Calculate coupon discount - use the discount calculated by the API
  const couponDiscount = appliedCoupon?.discount || 0
  
  const discountedSubtotal = subtotal - couponDiscount
  const displayTotal = discountedSubtotal + computedShippingCost

  // Persist selected shipping for checkout page to consume
  useEffect(() => {
    try {
      if (!selectedShipping) return
      const payload = { key: selectedShipping.key, name: selectedShipping.label, price: selectedShipping.price }
      sessionStorage.setItem('checkout_selected_shipping', JSON.stringify(payload))
    } catch {}
  }, [selectedShipping])

  // Persist applied coupon for checkout page to consume
  useEffect(() => {
    try {
      if (appliedCoupon) {
        sessionStorage.setItem('checkout_applied_coupon', JSON.stringify(appliedCoupon))
      } else {
        sessionStorage.removeItem('checkout_applied_coupon')
      }
    } catch {}
  }, [appliedCoupon])

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">
              Start adding some items to your cart to see them here.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Cart Status Header */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Cart Items ({cart.items.length})
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {cart.items.map((item, index) => {
                const imageSrc = item.product.images && item.product.images.length > 0
                  ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url)
                  : '/placeholder.jpg'

                const variantKey = (item as any)?.variant?._id || (item as any)?.variant?.value || 'default'
                const uniqueKey = `${item.product._id}-${variantKey}-${index}-${cart.items.length}`
                return (
                  <div key={uniqueKey} className={`p-3 sm:p-6 ${index !== cart.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex space-x-3">
                        {/* Left: Small Product Image */}
                        <div className="flex-shrink-0 w-[50px] h-[50px]">
                          <Link href={`/products/${item.product.slug}`} className="block w-full h-full">
                            <Image
                              src={imageSrc}
                              alt={item.product.name}
                              width={50}
                              height={50}
                              className="rounded object-cover w-full h-full"
                            />
                          </Link>
                        </div>

                        {/* Right: Product Name and Variant */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product.slug}`} className="block">
                            <h3 className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-gray-600 mt-1">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Price, Quantity, Total */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Per Unit Price */}
                        <div className="text-sm font-semibold text-gray-900">
                          ${(((item as any)?.variant?.price ?? item.product.price)).toFixed(2)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleQuantityChange(item.product._id, item.quantity - 1, item.variant)
                            }}
                            disabled={item.quantity <= 1 || isUpdating === item.product._id}
                            className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            <Minus className="w-3 h-3 pointer-events-none" />
                          </button>
                          <span className="px-2 py-1 text-gray-900 font-medium min-w-[1.5rem] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleQuantityChange(item.product._id, item.quantity + 1, item.variant)
                            }}
                            disabled={isUpdating === item.product._id}
                            className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            <Plus className="w-3 h-3 pointer-events-none" />
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-sm font-semibold text-gray-900">
                          ${((((item as any)?.variant?.price ?? item.product.price) * item.quantity)).toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveItem(item.product._id, item.variant)
                          }}
                          disabled={isUpdating === item.product._id}
                          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          type="button"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 className="w-3 h-3 pointer-events-none" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-[100px] h-[100px]">
                        <Link href={`/products/${item.product.slug}`} className="block w-full h-full">
                          <Image
                            src={imageSrc}
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 pr-4">
                            <Link href={`/products/${item.product.slug}`} className="block">
                              <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            
                            {item.variant && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.variant.name}: {item.variant.value}
                              </p>
                            )}
                            
                            {(item.variant?.sku || item.product.inventory?.sku) && (
                              <p className="text-sm text-gray-600 mt-1">
                                SKU: {item.variant?.sku || item.product.inventory?.sku}
                              </p>
                            )}
                            
                            <div className="flex items-center mt-3 space-x-4">
                              <span className="text-lg font-semibold text-gray-900">
                                ${(((item as any)?.variant?.price ?? item.product.price)).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity and Actions */}
                          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleQuantityChange(item.product._id, item.quantity - 1, item.variant)
                                }}
                                disabled={item.quantity <= 1 || isUpdating === item.product._id}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                aria-label={`Decrease quantity of ${item.product.name}`}
                              >
                                <Minus className="w-4 h-4 pointer-events-none" />
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleQuantityChange(item.product._id, item.quantity + 1, item.variant)
                                }}
                                disabled={isUpdating === item.product._id}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                aria-label={`Increase quantity of ${item.product.name}`}
                              >
                                <Plus className="w-4 h-4 pointer-events-none" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveItem(item.product._id, item.variant)
                              }}
                              disabled={isUpdating === item.product._id}
                              className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                              aria-label={`Remove ${item.product.name} from cart`}
                            >
                              <Trash2 className="w-5 h-5 pointer-events-none" />
                            </button>

                            {/* Item Total */}
                            <div className="text-right min-w-[80px]">
                              <p className="text-lg font-semibold text-gray-900">
                                ${((((item as any)?.variant?.price ?? item.product.price) * item.quantity)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-8">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">Order Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                {/* Coupon Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Coupon Code</h4>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">
                            {appliedCoupon.type === 'percentage' 
                              ? `${appliedCoupon.value}% off` 
                              : `$${appliedCoupon.value} off`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800 p-1"
                        aria-label="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          disabled={isApplyingCoupon}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || isApplyingCoupon}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-r-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplyingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-600">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Show discount in summary */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                    <span className="text-green-600">-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Shipping Method Selection (moved below discount) */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping</h4>
                  {shippingOptions.length === 0 ? (
                    <p className="text-sm text-gray-600">No shipping methods available.</p>
                  ) : (
                    <div className="space-y-2">
                      {shippingOptions.map((opt) => {
                        const isSelected = selectedShippingKey === opt.key
                        const priceText = opt.price === 0 ? 'Free' : `$${opt.price.toFixed(2)}`
                        return (
                          <label key={opt.key} className="flex items-center justify-between w-full cursor-pointer">
                            <div className="flex items-center min-w-0 flex-1">
                              <input
                                type="radio"
                                name="shippingMethod"
                                className="mr-2 flex-shrink-0"
                                checked={isSelected}
                                onChange={() => setSelectedShippingKey(opt.key)}
                              />
                              <span className="text-sm text-gray-800 truncate">{opt.label}</span>
                              {!isSelected && (
                                <span className="ml-2 text-xs text-gray-500">{priceText}</span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="ml-2 text-sm text-gray-900 flex-shrink-0">{priceText}</span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Tax row removed: prices include tax */}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/products"
                  className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}