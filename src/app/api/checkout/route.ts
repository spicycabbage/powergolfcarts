import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { items, successUrl, cancelUrl, shipping, selectedShipping } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Map cart items to Stripe line items
    const line_items = items.map((item: any) => {
      const name = String(item?.product?.name || 'Item')
      const unitAmount = Math.round(Number(item?.product?.price || 0) * 100)
      const quantity = Math.max(1, Number(item?.quantity || 1))
      return {
        price_data: {
          currency: 'usd',
          product_data: { name },
          unit_amount: unitAmount,
          // US sales tax will be calculated automatically by Stripe Tax
          tax_behavior: 'exclusive' as const,
        },
        quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: shipping?.email || undefined,
      // Enable automatic tax calculation (configure jurisdictions in Stripe Tax dashboard)
      automatic_tax: { enabled: true },
      // Create/attach a Stripe Customer so address persists for tax
      customer_creation: 'always',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      shipping_options: selectedShipping && typeof selectedShipping.price === 'number'
        ? [
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: Math.round(Number(selectedShipping.price) * 100), currency: 'usd' },
                display_name: selectedShipping.name || 'Shipping',
                // Ensure shipping is taxed according to the destination rules
                tax_behavior: 'exclusive' as const,
                tax_code: 'txcd_92010001',
              }
            }
          ]
        : undefined,
      metadata: {
        shipping_firstName: shipping?.firstName || '',
        shipping_lastName: shipping?.lastName || '',
        shipping_phone: shipping?.phone || '',
        shipping_address1: shipping?.address1 || '',
        shipping_address2: shipping?.address2 || '',
        shipping_city: shipping?.city || '',
        shipping_state: shipping?.state || '',
        shipping_postalCode: shipping?.postalCode || '',
        shipping_country: shipping?.country || '',
        shipping_selected_name: selectedShipping?.name || '',
        shipping_selected_price: typeof selectedShipping?.price === 'number' ? String(selectedShipping.price) : '',
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout/cancel`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err: any) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}


