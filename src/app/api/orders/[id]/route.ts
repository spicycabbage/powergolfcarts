import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const url = new URL(request.url)
    const meta = url.searchParams.get('meta')

    await connectToDatabase()

    // Fast meta path: return minimal fields without auth/session to show invoice quickly
    if (meta) {
      const metaOrder = await Order.findById(id).select('invoiceNumber createdAt').lean()
      if (!metaOrder) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: metaOrder })
    }

    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const order = await Order.findOne({ _id: id, user: session.user.id })
      .populate({ path: 'items.product', select: 'name slug price images' })
      .lean()

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (e) {
    console.error('Get order error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}


