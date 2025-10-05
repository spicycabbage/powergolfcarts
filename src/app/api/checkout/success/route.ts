import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent']
    })

    if (!stripeSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await connectToDatabase()

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({
      'paymentMethod.stripeSessionId': session_id
    })

    if (existingOrder) {
      return NextResponse.json({ 
        success: true, 
        order: {
          id: existingOrder._id,
          invoiceNumber: existingOrder.invoiceNumber
        }
      })
    }

    // Get session for user ID
    const session: any = await getServerSession(authOptions as any)

    // Parse items from metadata
    const metadata = stripeSession.metadata || {}
    let items: any[] = []
    
    try {
      if (metadata.items) {
        items = JSON.parse(metadata.items)
      }
    } catch (e) {
      console.error('Error parsing items from metadata:', e)
      return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Build order items
    const orderItems = items.map((item: any) => ({
      product: item.productId,
      variant: item.variant,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      total: Number(item.price || 0) * Number(item.quantity || 1),
    }))

    // Calculate totals
    const subtotal = Number(metadata.subtotal || 0)
    const bundleDiscount = Number(metadata.bundleDiscount || 0)
    const couponDiscount = Number(metadata.couponDiscount || 0)
    const shippingCost = Number(metadata.shipping_selected_price || 0)
    
    // Get tax from Stripe
    const taxAmount = stripeSession.total_details?.amount_tax 
      ? stripeSession.total_details.amount_tax / 100 
      : 0

    // Build coupon object if present
    const coupon = metadata.coupon_code ? {
      code: String(metadata.coupon_code).toUpperCase(),
      name: metadata.coupon_name || '',
      type: metadata.coupon_type as 'percentage' | 'fixed',
      value: Number(metadata.coupon_value || 0),
      discount: Number(metadata.coupon_discount || 0)
    } : undefined

    // Determine next invoice number
    const seedInvoice = 12000
    const last: any = await Order.findOne({ invoiceNumber: { $exists: true } })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean()
    const lastNum = last && Number.isFinite(Number(last.invoiceNumber)) ? Number(last.invoiceNumber) : undefined
    const nextInvoice = typeof lastNum === 'number' ? Math.max(seedInvoice, lastNum + 1) : seedInvoice

    // Create the order
    const order = await Order.create({
      user: session?.user?.id || undefined,
      items: orderItems,
      invoiceNumber: nextInvoice,
      subtotal,
      bundleDiscount,
      coupon,
      tax: taxAmount,
      shipping: shippingCost,
      total: (stripeSession.amount_total || 0) / 100,
      status: stripeSession.payment_status === 'paid' ? 'processing' : 'pending',
      paymentStatus: stripeSession.payment_status === 'paid' ? 'paid' : 'pending',
      paidAt: stripeSession.payment_status === 'paid' ? new Date() : undefined,
      shippingAddress: {
        firstName: metadata.shipping_firstName || '',
        lastName: metadata.shipping_lastName || '',
        address1: metadata.shipping_address1 || '',
        address2: metadata.shipping_address2 || '',
        city: metadata.shipping_city || '',
        state: metadata.shipping_state || '',
        postalCode: metadata.shipping_postalCode || '',
        country: metadata.shipping_country || '',
        phone: metadata.shipping_phone || '',
        email: metadata.shipping_email || stripeSession.customer_email || '',
      },
      billingAddress: {
        firstName: metadata.shipping_firstName || '',
        lastName: metadata.shipping_lastName || '',
        address1: metadata.shipping_address1 || '',
        address2: metadata.shipping_address2 || '',
        city: metadata.shipping_city || '',
        state: metadata.shipping_state || '',
        postalCode: metadata.shipping_postalCode || '',
        country: metadata.shipping_country || '',
        phone: metadata.shipping_phone || '',
      },
      paymentMethod: {
        type: 'stripe',
        stripeSessionId: session_id,
        stripePaymentIntentId: typeof stripeSession.payment_intent === 'string' 
          ? stripeSession.payment_intent 
          : stripeSession.payment_intent?.id,
      },
      contactEmail: metadata.shipping_email || stripeSession.customer_email || '',
    })

    console.log(`✅ Order created from Stripe session: ${order._id} (Invoice #${order.invoiceNumber})`)

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        invoiceNumber: order.invoiceNumber
      }
    })
  } catch (err: any) {
    console.error('Error processing Stripe success:', err)
    return NextResponse.json(
      { error: 'Failed to process order' }, 
      { status: 500 }
    )
  }
}
