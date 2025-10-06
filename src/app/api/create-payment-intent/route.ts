import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const { amount, currency = 'usd', metadata = {} } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err: any) {
    console.error('❌ Create payment intent error:', err)
    return NextResponse.json({ 
      error: 'Failed to create payment intent',
      message: err.message,
    }, { status: 500 })
  }
}
