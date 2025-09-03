'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart()

  const handleRemoveItem = (productId: string, variant?: any) => {
    try {
      removeItem(productId, variant)
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number, variant?: any) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, variant)
    } else {
      updateQuantity(productId, newQuantity, variant)
      toast.success('Quantity updated')
    }
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Cart cleared')
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>

            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Cart Status Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cart Items ({cart.items.length})
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: ${cart.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {cart.items.map((item, index) => {
                const product = item.product
                const imageSrc = product.images && product.images.length > 0
                  ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                  : '/placeholder.jpg'

                return (
                  <div key={product._id} className={`p-6 ${index !== cart.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-[100px] h-[100px]">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full">
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.slug}`} className="inline-block">
                          <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">{item.variant.name}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUpdateQuantity(product._id, item.quantity - 1, null)
                          }}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-gray-300 rounded hover:border-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <Minus className="w-4 h-4 pointer-events-none" />
                        </button>
                        <span className="px-3 py-1 text-center min-w-[3rem] border border-gray-300 rounded bg-gray-50">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUpdateQuantity(product._id, item.quantity + 1, null)
                          }}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-gray-300 rounded hover:border-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <Plus className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          ${(product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveItem(product._id, null)
                        }}
                        className="p-3 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 flex-shrink-0 border border-red-200 hover:border-red-600 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 relative"
                        title="Remove item from cart"
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 className="w-5 h-5 pointer-events-none" />
                        <span className="sr-only">Remove {product.name} from cart</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${cart.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {cart.shipping > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    Add ${(50 - cart.subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>

              <button
                onClick={() => {
                  clearCart()
                  toast.success('Cart cleared')
                }}
                className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors text-center mt-3"
              >
                Clear Cart
              </button>

              <Link
                href="/products"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: '3',
                name: 'Smart Fitness Watch',
                slug: 'smart-fitness-watch',
                price: 299.99,
                image: '/products/fitness-watch-1.jpg'
              },
              {
                id: '4',
                name: 'Modern Desk Lamp',
                slug: 'modern-desk-lamp',
                price: 79.99,
                image: '/products/desk-lamp-1.jpg'
              }
            ].map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}




