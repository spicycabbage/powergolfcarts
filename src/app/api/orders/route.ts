import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')

    await connectToDatabase()

    // Build query
    const query: any = { user: session.user.id }
    if (status) {
      query.status = status
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Get total count for pagination
    const total = await Order.countDocuments(query)

    // For now, just return the orders array directly
    // We can add pagination later if needed
    return NextResponse.json(orders)

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
