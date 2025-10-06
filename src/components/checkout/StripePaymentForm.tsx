'use client'

import { useEffect, useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export default function StripePaymentForm({ 
  onSuccess, 
  onError, 
  loading, 
  setLoading 
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return

      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.')
      onError(error.message || 'Payment failed')
      setLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else {
      setMessage('Payment processing...')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {message && (
        <div className={`text-sm ${message.includes('succeeded') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium ${
          !stripe || loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}
