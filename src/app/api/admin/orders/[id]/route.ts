import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import { sendEmail } from '@/lib/email'
import { buildOrderCompleteEmail } from '@/lib/emailTemplates'
import Order from '@/lib/models/Order'
import Product from '@/lib/models/Product'
import User from '@/lib/models/User'
import LoyaltyConfig from '@/lib/models/LoyaltyConfig'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const order = await Order.findById(id)
      .populate({ path: 'items.product', select: 'name slug price images variants inventory' })
      .populate({ path: 'user', select: 'email firstName lastName' })
      .lean()

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (e) {
    console.error('Admin get order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await request.json()
    const nextStatus = body?.status != null ? String(body.status).toLowerCase() : undefined
    const allowed = ['pending','cancelled','completed','processing','shipped','delivered','refunded']
    if (nextStatus && !allowed.includes(nextStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }
    const order: any = await Order.findById(id)
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    // If cancelling from a non-cancelled state, return inventory
    const wasCancelled = order.status === 'cancelled'
    if (nextStatus === 'cancelled' && !wasCancelled) {
      // For each item, if product has variants and the order variant matches, return that inventory; else return top-level quantity
      for (const it of order.items || []) {
        try {
          const product: any = await Product.findById(it.product)
          if (!product) continue
          if (Array.isArray(product.variants) && product.variants.length > 0 && it.variant && it.variant.value) {
            const idx = product.variants.findIndex((v: any) => String(v?.value).toLowerCase() === String(it.variant.value).toLowerCase())
            if (idx >= 0) {
              const cur = Number(product.variants[idx].inventory || 0)
              product.variants[idx].inventory = Math.max(0, cur + Number(it.quantity || 0))
            }
          } else {
            if (!product.inventory) {
              product.inventory = { quantity: 0, lowStockThreshold: 5, sku: '', trackInventory: true } as any
            }
            const cur = Number(product.inventory.quantity || 0)
            product.inventory.quantity = Math.max(0, cur + Number(it.quantity || 0))
          }
          await product.save()
        } catch {}
      }
    }

    const oldStatus = order.status
    if (nextStatus) order.status = nextStatus

    // Backwards compatible single tracking fields
    if (typeof body?.trackingNumber === 'string') order.trackingNumber = body.trackingNumber
    if (typeof body?.trackingCarrier === 'string') order.trackingCarrier = body.trackingCarrier

    // Add tracking entry (supports multiple)
    const add = body?.addTracking
    if (add && typeof add?.carrier === 'string' && typeof add?.number === 'string') {
      const carrier = String(add.carrier).trim()
      const number = String(add.number).trim()
      if (carrier && number) {
        if (!Array.isArray((order as any).tracking)) (order as any).tracking = []
        const exists = (order as any).tracking.some((t: any) => String(t.carrier).toLowerCase() === carrier.toLowerCase() && String(t.number) === number)
        if (!exists) {
          ;(order as any).tracking.push({ carrier, number, createdAt: new Date() })
        }
        // also set the flat fields to the latest for compatibility
        order.trackingCarrier = carrier
        order.trackingNumber = number
      }
    }

    // Delete tracking entry
    const del = body?.deleteTracking
    if (del && (typeof del?.carrier === 'string' || typeof del?.number === 'string')) {
      const carrier = typeof del?.carrier === 'string' ? String(del.carrier) : undefined
      const number = typeof del?.number === 'string' ? String(del.number) : undefined
      if (Array.isArray((order as any).tracking) && (carrier || number)) {
        (order as any).tracking = (order as any).tracking.filter((t: any) => {
          const carrierMatch = carrier ? String(t.carrier).toLowerCase() === carrier.toLowerCase() : true
          const numberMatch = number ? String(t.number) === number : true
          return !(carrierMatch && numberMatch)
        })
      }
      // if no tracking entries remain, clear flat fields; or if we removed the active one
      const hasAny = Array.isArray((order as any).tracking) && (order as any).tracking.length > 0
      if (!hasAny) {
        order.trackingCarrier = undefined as any
        order.trackingNumber = undefined as any
      } else if (carrier && order.trackingCarrier && order.trackingCarrier.toLowerCase() === carrier.toLowerCase() && (!number || number === order.trackingNumber)) {
        const first = (order as any).tracking[0]
        order.trackingCarrier = first?.carrier
        order.trackingNumber = first?.number
      }
    }
    await order.save()

    // If status changed to completed, send email and award loyalty points (first time only)
    if (nextStatus === 'completed' && oldStatus !== 'completed') {
      try {
        // Re-load with details for email
        const fresh: any = await Order.findById(id)
          .populate({ path: 'user', select: 'email firstName lastName' })
          .populate({ path: 'items.product', select: 'name' })
          .lean()

        const to = String(fresh?.user?.email || fresh?.contactEmail || fresh?.shippingAddress?.email || '')
        if (to) {
          const firstName = String(fresh?.user?.firstName || '').trim() || 'Customer'
          const invoice = fresh?.invoiceNumber ?? fresh?._id
          const trackings: Array<{ carrier: string; number: string }> = Array.isArray(fresh?.tracking) && fresh.tracking.length > 0
            ? fresh.tracking.map((t: any) => ({ carrier: String(t?.carrier || ''), number: String(t?.number || '') }))
            : (fresh?.trackingCarrier && fresh?.trackingNumber ? [{ carrier: String(fresh.trackingCarrier), number: String(fresh.trackingNumber) }] : [])

          const trackingLinks = trackings.map(t => {
            const lc = t.carrier.toLowerCase()
            const nice = lc === 'canadapost' ? 'Canada Post' : (lc === 'purolator' ? 'Purolator' : t.carrier)
            const url = lc === 'canadapost'
              ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(t.number)}`
              : (lc === 'purolator' ? `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(t.number)}` : '')
            const text = url ? `<a href="${url}">${t.number}</a>` : t.number
            return `<div>${nice} ${text}</div>`
          }).join('') || '<div>No tracking available yet.</div>'

          const itemsHtml = (Array.isArray(fresh?.items) ? fresh.items : []).map((it: any) => {
            const name = it?.product?.name || it?.name || 'Item'
            const variant = it?.variant?.value ? ` (${it.variant.value})` : ''
            const qty = Number(it?.quantity || 0)
            const total = Number(it?.total || 0)
            return `<li>${name}${variant} x ${qty} — $${total.toFixed(2)}</li>`
          }).join('')

          const ship = fresh?.shippingAddress || {}
          const addressHtml = `
            <div>${ship.firstName || ''} ${ship.lastName || ''}</div>
            <div>${ship.address1 || ''}${ship.address2 ? ', ' + ship.address2 : ''}</div>
            <div>${ship.city || ''}, ${ship.state || ''} ${ship.postalCode || ''}</div>
            <div>${ship.country || ''}</div>
          `

          const html = buildOrderCompleteEmail({ ...fresh, tracking: trackings.map(t => ({ carrier: t.carrier, number: t.number })) })
          sendEmail(to, `Your Order #${invoice} is Complete`, html).catch(err => console.error('sendEmail error:', err))
        }
        // Award loyalty points
        try {
          const doc: any = await Order.findById(id)
          if (doc && !doc.loyaltyPointsAwarded) {
            const cfg = await LoyaltyConfig.findOne().lean()
            const rate = Number((cfg as any)?.pointsPerDollar ?? 1)
            const base = Number(doc.subtotal || 0)
            const discount = Number(doc?.coupon?.discount || 0)
            const spend = Math.max(0, base - discount)
            const points = Math.floor(spend * Number(rate))
            if (points > 0 && doc.user) {
              const user = await User.findById(doc.user)
              if (user) {
                user.loyaltyPoints = Math.max(0, Number(user.loyaltyPoints || 0) + points) as any
                await user.save()
                doc.loyaltyPoints = points as any
              } else {
                doc.loyaltyPoints = 0 as any
              }
            } else {
              doc.loyaltyPoints = 0 as any
            }
            doc.loyaltyPointsAwarded = true as any
            await doc.save()
          }
        } catch (e) {
          console.error('Loyalty award error:', e)
        }
      } catch (err) {
        console.error('Complete order email error:', err)
      }
    }

    // If status changed to cancelled, notify customer
    if (nextStatus === 'cancelled' && oldStatus !== 'cancelled') {
      try {
        const fresh: any = await Order.findById(id)
          .populate({ path: 'user', select: 'email firstName lastName' })
          .lean()
        const to = String(fresh?.user?.email || fresh?.contactEmail || fresh?.shippingAddress?.email || '')
        if (to) {
          const invoice = fresh?.invoiceNumber ?? fresh?._id
          const html = `
            <div>
              <h2>Order Cancelled</h2>
              <p>Your order <strong>#${invoice}</strong> has been cancelled.</p>
              <p>We have not received a payment for this order so we assume it's no longer wanted. If you still wish to keep this order, please respond to this email. Thanks.</p>
              <div style="margin-top:16px;color:#6b7280;font-size:12px;">
                Thank you for shopping at <a href="https://www.godbud.cc">www.godbud.cc</a><br/>
                Member of the Canada Kush network.
              </div>
            </div>
          `
          await sendEmail(to, `Order #${invoice} Cancelled`, html)
        }
      } catch (err) {
        console.error('Cancel order email error:', err)
      }
    }

    const result = order.toObject ? (order as any).toObject() : order
    return NextResponse.json({ success: true, data: {
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingCarrier: order.trackingCarrier,
      tracking: (result && result.tracking) || []
    } })
  } catch (e: any) {
    console.error('Admin update order error:', e)
    return NextResponse.json({ success: false, error: process.env.NODE_ENV !== 'production' ? (e?.message || 'Failed to update order') : 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    await Order.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin delete order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 })
  }
}


