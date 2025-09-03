'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(productId)
    try {
      updateQuantity(productId, newQuantity)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(productId)
    try {
      removeItem(productId)
    } finally {
      setIsUpdating(null)
    }
  }

  const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

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

                return (
                  <div key={`${item.product._id}-${item.variant || 'default'}`} className={`p-6 ${index !== cart.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center space-x-4">
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
                            
                            <p className="text-sm text-gray-600 mt-1">SKU: {item.product.sku}</p>
                            
                            <div className="flex items-center mt-3 space-x-4">
                              <span className="text-lg font-semibold text-gray-900">
                                ${item.product.price.toFixed(2)}
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
                                  handleQuantityChange(item.product._id, item.quantity - 1)
                                }}
                                disabled={item.quantity <= 1 || isUpdating === item.product._id}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
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
                                  handleQuantityChange(item.product._id, item.quantity + 1)
                                }}
                                disabled={isUpdating === item.product._id}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                              >
                                <Plus className="w-4 h-4 pointer-events-none" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveItem(item.product._id)
                              }}
                              disabled={isUpdating === item.product._id}
                              className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5 pointer-events-none" />
                            </button>

                            {/* Item Total */}
                            <div className="text-right min-w-[80px]">
                              <p className="text-lg font-semibold text-gray-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
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
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
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