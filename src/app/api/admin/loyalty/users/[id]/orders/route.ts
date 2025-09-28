import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find({ user: id })
        .select('invoiceNumber createdAt items subtotal shipping total coupon status loyaltyPoints loyaltyPointsAwarded')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: id })
    ])

    return NextResponse.json({ success: true, data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (e) {
    console.error('Admin loyalty: list user orders error', e)
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 })
  }
}
