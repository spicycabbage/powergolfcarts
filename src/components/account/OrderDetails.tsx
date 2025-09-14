'use client'

import { useState, useEffect } from 'react'
import { IOrder } from '@/lib/models/Order'

interface OrderDetailsProps {
  userId?: string
}

export default function OrderDetails({ userId }: OrderDetailsProps) {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?page=${currentPage}&limit=10`)
        if (!response.ok) {
          // Don't throw error, just set empty orders
          setOrders([])
          return
        }
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data)
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages)
            setTotalOrders(data.pagination.total)
          }
        } else {
          setOrders([])
        }
      } catch (err) {
        // Don't set error, just set empty orders
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchOrders()
    }
  }, [userId, currentPage])

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const buildTrackingUrl = (carrier?: string, trackingNumber?: string) => {
    if (!carrier || !trackingNumber) return null
    
    const lc = carrier.toLowerCase()
    if (lc === 'canadapost' || lc === 'canada post' || lc === 'canada-post') {
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(trackingNumber)}`
    }
    if (lc === 'purolator') {
      return `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(trackingNumber)}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading orders
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If an order is selected, show detailed view
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          <button
            onClick={() => {
              setSelectedOrder(null)
              setLoading(false) // Don't show loading when going back
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Order #{(selectedOrder as any).invoiceNumber || selectedOrder._id?.toString().slice(-8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(selectedOrder.createdAt || new Date())}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
            <div className="space-y-2">
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600">
                      {item.quantity}x
                    </span>
                    <span className="ml-2 text-gray-900">
                      {(item.product as any)?.name || `Product #${item.product.toString().slice(-6)}`}
                    </span>
                    {item.variant && (
                      <span className="ml-2 text-gray-500">
                        ({item.variant.name}: {item.variant.value})
                      </span>
                    )}
                  </div>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {(selectedOrder as any).coupon && (
                <div className="flex justify-between">
                  <span className="text-green-600">Discount ({(selectedOrder as any).coupon.code}):</span>
                  <span className="text-green-600">-{formatCurrency((selectedOrder as any).coupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">{formatCurrency(selectedOrder.shipping)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600">
                  <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p>{selectedOrder.shippingAddress.address1}</p>
                  {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.shippingAddress.phone && <p>{selectedOrder.shippingAddress.phone}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Payment & Tracking</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                </span>
                {(selectedOrder.trackingNumber || (Array.isArray((selectedOrder as any).tracking) && (selectedOrder as any).tracking.length > 0)) && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 font-medium mb-1">Tracking:</p>
                    {selectedOrder.trackingNumber && (
                      <div className="text-sm">
                        {(() => {
                          const url = buildTrackingUrl(selectedOrder.trackingCarrier, selectedOrder.trackingNumber)
                          return url ? (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-700 underline font-mono"
                            >
                              {selectedOrder.trackingNumber}
                            </a>
                          ) : (
                            <span className="font-mono">{selectedOrder.trackingNumber}</span>
                          )
                        })()}
                      </div>
                    )}
                    {Array.isArray((selectedOrder as any).tracking) && (selectedOrder as any).tracking.length > 0 && (
                      <div className="space-y-1">
                        {(selectedOrder as any).tracking.map((track: any, idx: number) => {
                          const url = buildTrackingUrl(track.carrier, track.number)
                          return (
                            <div key={idx} className="text-sm">
                              {url ? (
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-700 underline font-mono"
                                >
                                  {track.number}
                                </a>
                              ) : (
                                <span className="font-mono">{track.number}</span>
                              )}
                              <span className="text-gray-500 ml-2">({track.carrier})</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => {
                const getOrderStatus = () => {
                  if (order.status === 'cancelled') {
                    return { text: 'Cancelled', color: 'text-red-600' }
                  }
                  
                  // Check for tracking information
                  const hasTracking = order.trackingNumber || 
                    (Array.isArray((order as any).tracking) && (order as any).tracking.length > 0)
                  
                  if (hasTracking) {
                    const trackingNumber = order.trackingNumber || 
                      (Array.isArray((order as any).tracking) && (order as any).tracking.length > 0 
                        ? (order as any).tracking[0].number 
                        : '')
                    const carrier = order.trackingCarrier || 
                      (Array.isArray((order as any).tracking) && (order as any).tracking.length > 0 
                        ? (order as any).tracking[0].carrier 
                        : '')
                    const trackingUrl = buildTrackingUrl(carrier, trackingNumber)
                    return { 
                      text: trackingNumber, 
                      color: 'text-blue-600 font-mono hover:text-blue-700 underline cursor-pointer',
                      url: trackingUrl
                    }
                  }
                  
                  return { text: 'Pending', color: 'text-yellow-600' }
                }

                const orderStatus = getOrderStatus()

                return (
                  <li key={order._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline truncate text-left"
                          >
                            Order #{(order as any).invoiceNumber || order._id?.toString().slice(-8).toUpperCase()}
                          </button>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt || new Date())}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.total)}
                            </p>
                            {(order as any).coupon && (
                              <p className="text-xs text-green-600">
                                Saved {formatCurrency((order as any).coupon.discount)}
                              </p>
                            )}
                          </div>
                          <div className="text-right min-w-0">
                            {(orderStatus as any).url ? (
                              <a
                                href={(orderStatus as any).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-medium ${orderStatus.color} truncate block`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {orderStatus.text}
                              </a>
                            ) : (
                              <p className={`text-sm font-medium ${orderStatus.color} truncate`}>
                                {orderStatus.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'text-white bg-blue-600 border border-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
