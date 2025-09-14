import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    const isAdmin = !!(session && session.user && (session.user as any).role === 'admin')
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit') || 20)))
    const skip = (page - 1) * limit

    await connectToDatabase()
    const total = await Order.countDocuments({})
    const data = await Order.find({})
      .select('invoiceNumber createdAt subtotal shipping total status shippingAddress items tracking trackingNumber trackingCarrier coupon contactEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // compute itemCount only (avoid sending full items to lighten payload)
    const lightweight = data.map((o: any) => ({
      _id: o._id,
      invoiceNumber: o.invoiceNumber,
      createdAt: o.createdAt,
      shippingAddress: o.shippingAddress ? { firstName: o.shippingAddress.firstName, lastName: o.shippingAddress.lastName, email: o.shippingAddress.email } : undefined,
      contactEmail: o.contactEmail || o.shippingAddress?.email,
      itemCount: Array.isArray(o.items) ? o.items.reduce((s: number, it: any) => s + Number(it?.quantity || 0), 0) : 0,
      total: o.total,
      status: o.status,
      tracking: o.tracking || [],
      trackingNumber: o.trackingNumber,
      trackingCarrier: o.trackingCarrier,
      subtotal: o.subtotal,
      shipping: o.shipping,
      coupon: o.coupon ? { code: o.coupon.code, discount: Number(o.coupon.discount || 0) } : undefined,
    }))

    return NextResponse.json({ success: true, data: lightweight, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } })
  } catch (e) {
    console.error('Admin orders GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 })
  }
}


