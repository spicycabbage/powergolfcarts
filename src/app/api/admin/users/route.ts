import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Order from '@/lib/models/Order'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role !== 'all') {
      query.role = role
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active'
    }

    // Get total count
    const total = await User.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Get users
    const users = await User.find(query)
      .select('email firstName lastName role isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get order data for each user (only completed orders)
    const usersWithOrderData = await Promise.all(
      users.map(async (user) => {
        // Get all completed orders for this user
        const completedOrders = await Order.find({ 
          user: user._id, 
          status: 'completed' 
        })
        .select('_id invoiceNumber total status createdAt')
        .sort({ createdAt: -1 })
        .lean()

        // Calculate total order value from completed orders only
        const totalOrderValue = completedOrders.reduce((sum, order) => sum + order.total, 0)
        
        // Get latest 3 completed orders
        const latestOrders = completedOrders.slice(0, 3)

        return {
          ...user,
          orders: latestOrders,
          totalOrderValue,
          completedOrderCount: completedOrders.length
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: usersWithOrderData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
