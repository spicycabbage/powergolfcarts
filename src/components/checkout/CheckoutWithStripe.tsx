'use client'

import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutWithStripeProps {
  amount: number
  children: React.ReactNode
}

export default function CheckoutWithStripe({ amount, children }: CheckoutWithStripeProps) {
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        }
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error)
      })
  }, [amount])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#16a34a',
      },
    },
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment form...</p>
      </div>
    )
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      {children}
    </Elements>
  )
}
