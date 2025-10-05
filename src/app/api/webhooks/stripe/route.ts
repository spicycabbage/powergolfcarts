import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('❌ No stripe-signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log(`✅ Webhook received: ${event.type}`)

  try {
    await connectToDatabase()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('💳 Checkout session completed:', session.id)
        console.log('Payment status:', session.payment_status)
        console.log('Customer email:', session.customer_email)

        // Find the order by metadata or create a new one
        const orderId = session.metadata?.orderId

        if (orderId) {
          // Update existing order
          const order = await Order.findById(orderId)
          
          if (order) {
            order.paymentMethod = {
              type: 'stripe',
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            }
            order.status = session.payment_status === 'paid' ? 'processing' : 'pending'
            
            if (session.payment_status === 'paid') {
              order.paidAt = new Date()
            }

            // Update tax amount from Stripe
            if (session.total_details?.amount_tax) {
              order.tax = session.total_details.amount_tax / 100
              order.total = (order.subtotal || 0) + (order.shipping || 0) + (order.tax || 0) - (order.bundleDiscount || 0) - (order.coupon?.discount || 0)
            }

            await order.save()
            console.log(`✅ Order ${orderId} updated with payment info`)
          } else {
            console.error(`❌ Order ${orderId} not found`)
          }
        } else {
          console.log('⚠️ No orderId in metadata, order should be created by success page')
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💰 Payment succeeded:', paymentIntent.id)

        // Find order by payment intent ID
        const order = await Order.findOne({
          'paymentMethod.stripePaymentIntentId': paymentIntent.id,
        })

        if (order && order.status !== 'processing') {
          order.status = 'processing'
          order.paidAt = new Date()
          await order.save()
          console.log(`✅ Order ${order._id} marked as processing`)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('❌ Payment failed:', paymentIntent.id)

        const order = await Order.findOne({
          'paymentMethod.stripePaymentIntentId': paymentIntent.id,
        })

        if (order) {
          order.status = 'cancelled'
          await order.save()
          console.log(`✅ Order ${order._id} marked as cancelled`)
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log('💸 Charge refunded:', charge.id)

        const order = await Order.findOne({
          'paymentMethod.stripePaymentIntentId': charge.payment_intent,
        })

        if (order) {
          order.status = 'refunded'
          await order.save()
          console.log(`✅ Order ${order._id} marked as refunded`)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}
