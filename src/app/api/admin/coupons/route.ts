import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'

// GET /api/admin/coupons - List all coupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ]
    }

    if (status === 'active') {
      query.isActive = true
      query.validFrom = { $lte: new Date() }
      query.validUntil = { $gte: new Date() }
    } else if (status === 'inactive') {
      query.isActive = false
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() }
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const {
      code,
      name,
      description,
      type,
      value,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive,
      applicableCategories,
      excludedCategories,
      applicableProducts,
      excludedProducts
    } = body
    const effectiveName = name || code

    // Validate required fields
    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const fromDate = new Date(validFrom)
    const untilDate = new Date(validUntil)
    
    if (untilDate <= fromDate) {
      return NextResponse.json(
        { success: false, error: 'Valid until date must be after valid from date' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name: effectiveName,
      description,
      type,
      value: Number(value),
      minimumOrderAmount: minimumOrderAmount != null ? Number(minimumOrderAmount) : undefined,
      maximumDiscountAmount: maximumDiscountAmount != null ? Number(maximumDiscountAmount) : undefined,
      usageLimit: usageLimit != null ? Number(usageLimit) : undefined,
      userUsageLimit: userUsageLimit != null ? Number(userUsageLimit) : undefined,
      validFrom: fromDate,
      validUntil: untilDate,
      isActive: isActive !== false,
      applicableCategories: applicableCategories || [],
      excludedCategories: excludedCategories || [],
      applicableProducts: applicableProducts || [],
      excludedProducts: excludedProducts || [],
      createdBy: session.user.id
    })

    const savedCoupon = await coupon.save()
    await savedCoupon.populate('createdBy', 'firstName lastName email')

    return NextResponse.json({
      success: true,
      data: savedCoupon
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating coupon:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
