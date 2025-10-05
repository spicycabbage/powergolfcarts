'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('No session ID found')
      setLoading(false)
      return
    }

    // Process the Stripe session and create order
    const processOrder = async () => {
      try {
        const response = await fetch('/api/checkout/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to process order')
        }

        setOrder(data.order)
        
        // Clear cart and redirect to confirmation
        try {
          localStorage.removeItem('cart')
          sessionStorage.removeItem('checkout_shipping')
          sessionStorage.removeItem('checkout_selected_shipping')
          sessionStorage.removeItem('checkout_order_summary')
          sessionStorage.removeItem('checkout_items')
          sessionStorage.removeItem('checkout_applied_coupon')
          sessionStorage.removeItem('checkout_referral')
          sessionStorage.removeItem('checkout_idem')
        } catch (e) {
          console.error('Error clearing storage:', e)
        }

        // Redirect to confirmation page with order ID
        setTimeout(() => {
          router.push(`/checkout/confirmation?order=${data.order.id}`)
        }, 2000)
      } catch (err: any) {
        console.error('Error processing order:', err)
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    processOrder()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Your Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your order.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Return to Cart
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-2">
          Your order has been confirmed.
        </p>
        {order?.invoiceNumber && (
          <p className="text-sm text-gray-500 mb-6">
            Invoice #{order.invoiceNumber}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Redirecting to order confirmation...
        </p>
      </div>
    </div>
  )
}