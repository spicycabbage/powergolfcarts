import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const { 
      items, 
      successUrl, 
      cancelUrl, 
      shipping, 
      selectedShipping,
      orderSummary,
      appliedCoupon,
      referralData
    } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Map cart items to Stripe line items
    const line_items = items.map((item: any) => {
      // Use variant price if available, otherwise product price
      const itemPrice = item.variant?.price ?? item.price ?? 0
      const name = String(item.name || 'Item')
      const unitAmount = Math.round(Number(itemPrice) * 100)
      const quantity = Math.max(1, Number(item.quantity || 1))
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name,
            description: item.variant ? `${item.variant.name}: ${item.variant.value}` : undefined,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: unitAmount,
          // US sales tax will be calculated automatically by Stripe Tax
          tax_behavior: 'exclusive' as const,
        },
        quantity,
      }
    })

    // Build metadata object with all order information
    const metadata: Record<string, string> = {
      shipping_firstName: shipping?.firstName || '',
      shipping_lastName: shipping?.lastName || '',
      shipping_email: shipping?.email || '',
      shipping_phone: shipping?.phone || '',
      shipping_address1: shipping?.address1 || '',
      shipping_address2: shipping?.address2 || '',
      shipping_city: shipping?.city || '',
      shipping_state: shipping?.state || '',
      shipping_postalCode: shipping?.postalCode || '',
      shipping_country: shipping?.country || '',
      shipping_selected_name: selectedShipping?.name || '',
      shipping_selected_price: typeof selectedShipping?.price === 'number' ? String(selectedShipping.price) : '',
      subtotal: String(orderSummary?.subtotal || 0),
      bundleDiscount: String(orderSummary?.bundleDiscount || 0),
      couponDiscount: String(orderSummary?.couponDiscount || 0),
    }

    // Add coupon data if present
    if (appliedCoupon) {
      metadata.coupon_code = appliedCoupon.code || ''
      metadata.coupon_name = appliedCoupon.name || ''
      metadata.coupon_type = appliedCoupon.type || ''
      metadata.coupon_value = String(appliedCoupon.value || 0)
      metadata.coupon_discount = String(appliedCoupon.discount || 0)
    }

    // Add referral data if present
    if (referralData) {
      metadata.referral_code = referralData.code || ''
      metadata.referral_source = referralData.source || ''
    }

    // Add item data (limit metadata size)
    metadata.items = JSON.stringify(items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant,
    })))

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
                tax_code: 'txcd_92030000' as const,
              }
            }
          ]
        : undefined,
      metadata,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err: any) {
    console.error('Checkout session error:', err)
    console.error('Error details:', err.message, err.stack)
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 })
  }
}


