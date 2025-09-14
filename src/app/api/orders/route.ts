import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import Product from '@/lib/models/Product'
import Coupon from '@/lib/models/Coupon'
import { sendEmail } from '@/lib/email'
import { buildOrderPlacedEmail } from '@/lib/emailTemplates'

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    await connectToDatabase()

    // Get total count for pagination
    const total = await Order.countDocuments({ user: session.user.id })
    const totalPages = Math.ceil(total / limit)

    const orders = await Order.find({ user: session.user.id })
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// use shared sendEmail from lib/email

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)

    const body = await req.json()
    const { items, subtotal, couponDiscount, appliedCoupon, shipping, total, shippingAddress, storeCreditUsed, customerEmail } = body || {}
    if (!Array.isArray(items) || typeof subtotal !== 'number' || typeof shipping !== 'number' || typeof total !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    await connectToDatabase()

    const orderItems = items.map((it: any) => ({
      product: it.productId,
      variant: it.variant,
      quantity: Number(it.quantity || 1),
      price: Number(it.price || 0),
      total: Number(it.price || 0) * Number(it.quantity || 1),
    }))

    // Determine next invoice number (start at 12000)
    const seedInvoice = 12000
    const last: any = await Order.findOne({ invoiceNumber: { $exists: true } })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean()
    const lastNum = last && Number.isFinite(Number(last.invoiceNumber)) ? Number(last.invoiceNumber) : undefined
    const nextInvoice = typeof lastNum === 'number' ? Math.max(seedInvoice, lastNum + 1) : seedInvoice

    // Handle coupon usage tracking and enforce per-user limit server-side
    if (appliedCoupon && appliedCoupon.code) {
      try {
        const coupon = await Coupon.findOne({ code: appliedCoupon.code.toUpperCase() })
        if (coupon) {
          // Enforce per-user usage limit
          if (coupon.userUsageLimit && session.user.id) {
            const usedByUser = await Order.countDocuments({
              user: session.user.id,
              'coupon.code': { $regex: `^${coupon.code}$`, $options: 'i' },
              status: { $ne: 'cancelled' }
            })
            if (usedByUser >= coupon.userUsageLimit) {
              return NextResponse.json({ success: false, error: 'Coupon usage limit reached for this user' }, { status: 400 })
            }
          }

          // Increment total usage count (best-effort)
          coupon.usageCount = (coupon.usageCount || 0) + 1
          await coupon.save()
        }
      } catch (couponError) {
        console.error('Error updating coupon usage:', couponError)
        // Don't fail the order if coupon update fails
      }
    }

    const order = await Order.create({
      user: session?.user?.id || undefined,
      items: orderItems,
      invoiceNumber: nextInvoice,
      subtotal,
      coupon: appliedCoupon ? {
        code: String(appliedCoupon.code || '').toUpperCase(),
        name: appliedCoupon.name,
        type: appliedCoupon.type,
        value: appliedCoupon.value,
        discount: appliedCoupon.discount
      } : undefined,
      tax: 0,
      shipping,
      total: Math.max(0, Number(subtotal || 0) + Number(0) + Number(shipping || 0) - Number(appliedCoupon?.discount || 0) - Number(storeCreditUsed || 0)),
      status: 'pending',
      shippingAddress: {
        firstName: shippingAddress?.firstName || '',
        lastName: shippingAddress?.lastName || '',
        company: shippingAddress?.company || '',
        address1: shippingAddress?.address1 || '',
        address2: shippingAddress?.address2 || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || '',
        phone: shippingAddress?.phone || '',
        email: shippingAddress?.email || customerEmail || session?.user?.email || '',
      },
      billingAddress: {
        firstName: shippingAddress?.firstName || '',
        lastName: shippingAddress?.lastName || '',
        company: shippingAddress?.company || '',
        address1: shippingAddress?.address1 || '',
        address2: shippingAddress?.address2 || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || '',
        phone: shippingAddress?.phone || '',
      },
      paymentMethod: { type: 'bank_transfer' },
      contactEmail: (shippingAddress?.email || customerEmail || session?.user?.email || ''),
    })

    // If a loyalty coupon code was used, mark it as used on the user
    try {
      if (appliedCoupon?.code && session?.user?.id) {
        const user: any = await (await import('@/lib/models/User')).default.findById(session.user.id)
        if (user && Array.isArray(user.loyaltyCoupons)) {
          const idx = user.loyaltyCoupons.findIndex((c: any) => String(c.code).toUpperCase() === String(appliedCoupon.code).toUpperCase())
          if (idx >= 0 && !user.loyaltyCoupons[idx].usedAt) {
            user.loyaltyCoupons[idx].usedAt = new Date() as any
            await user.save()
          }
        }
      }
    } catch (markErr) {
      console.error('Mark loyalty coupon used error:', markErr)
    }

    // Deduct store credit from user
    try {
      const scUsed = Number(storeCreditUsed || 0)
      if (scUsed > 0) {
        const userModel = (await import('@/lib/models/User')).default
        const userDoc: any = await userModel.findById(session.user.id)
        if (userDoc) {
          userDoc.storeCredit = Math.max(0, Number(userDoc.storeCredit || 0) - scUsed) as any
          await userDoc.save()
        }
      }
    } catch (e) {
      console.error('Store credit deduction error:', e)
    }

    // Decrement inventory for each item (variant-aware)
    try {
      for (const it of orderItems) {
        const product: any = await Product.findById(it.product)
        if (!product) continue
        const qty = Number(it.quantity || 0)
        if (qty <= 0) continue

        if (Array.isArray(product.variants) && product.variants.length > 0 && it.variant) {
          const v = it.variant || {}
          let idx = -1
          if (v._id) idx = product.variants.findIndex((pv: any) => String(pv?._id) === String(v._id))
          if (idx < 0 && v.sku) idx = product.variants.findIndex((pv: any) => String(pv?.sku || '').toLowerCase() === String(v.sku).toLowerCase())
          if (idx < 0 && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
          if (idx < 0 && v.name && v.value) idx = product.variants.findIndex((pv: any) => String(pv?.name || '').trim().toLowerCase() === String(v.name).trim().toLowerCase() && String(pv?.value || '').trim().toLowerCase() === String(v.value).trim().toLowerCase())
          if (idx >= 0) {
            const cur = Number(product.variants[idx].inventory || 0)
            product.variants[idx].inventory = Math.max(0, cur - qty)
            product.markModified('variants')
          }
        } else {
          if (!product.inventory) {
            product.inventory = { quantity: 0, lowStockThreshold: 5, sku: '', trackInventory: true } as any
          }
          if (product.inventory.trackInventory !== false) {
            const cur = Number(product.inventory.quantity || 0)
            product.inventory.quantity = Math.max(0, cur - qty)
          }
        }
        await product.save()
      }
    } catch (invErr) {
      console.error('Order inventory decrement error:', invErr)
    }

    const orderId = String(order._id)
    const itemsForTemplate = orderItems.map((o:any)=>({ name: o.name || '', quantity: o.quantity, total: Number(o.total||0), product: { name: o.name || '' }, variant: o.variant }))
    const orderHtml = buildOrderPlacedEmail({
      invoiceNumber: nextInvoice,
      items: itemsForTemplate,
      subtotal,
      shipping,
      total,
      shippingAddress
    })
    // Customer email (guest or logged-in)
    const emailTo = (session?.user?.email as string) || (shippingAddress as any)?.email || String(customerEmail || '')
    if (emailTo) {
      await sendEmail(emailTo, `Order Confirmation #${nextInvoice}`, orderHtml)
    }
    // Admin email
    if (process.env.ORDERS_ADMIN_EMAIL) {
      await sendEmail(process.env.ORDERS_ADMIN_EMAIL, `New Order #${nextInvoice} Received`, orderHtml)
    }

    return NextResponse.json({ success: true, data: { id: orderId, invoiceNumber: nextInvoice } })
  } catch (e) {
    console.error('Create order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}


