import { Stripe, loadStripe } from '@stripe/stripe-js'
import StripeServer from 'stripe'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Server-side Stripe client
export const stripe = new StripeServer(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Helper functions for common Stripe operations
export const stripeHelpers = {
  // Create a payment intent
  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      })
      return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  // Confirm a payment intent
  confirmPaymentIntent: async (paymentIntentId: string) => {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw error
    }
  },

  // Retrieve a payment intent
  retrievePaymentIntent: async (paymentIntentId: string) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw error
    }
  },

  // Create a customer
  createCustomer: async (email: string, name: string) => {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      })
      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  },

  // Create a refund
  createRefund: async (paymentIntentId: string, amount?: number) => {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })
      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw error
    }
  },

  // Webhook signature verification
  constructEvent: (payload: string | Buffer, signature: string, webhookSecret: string) => {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }
}

export default stripe


