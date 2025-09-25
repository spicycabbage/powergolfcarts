import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import ReferralRelationship from '@/models/ReferralRelationship'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const statusFilter = searchParams.get('status')
    const skip = (page - 1) * limit

    await connectToDatabase()

    const query: any = {}
    if (statusFilter === 'active') {
      query.isActive = true
    } else if (statusFilter === 'inactive') {
      query.isActive = false
    }

    const total = await ReferralRelationship.countDocuments(query)
    const relationships = await ReferralRelationship.find(query)
      .populate('referrer', 'firstName lastName email referralCode loyaltyPoints')
      .populate('referred', 'firstName lastName email loyaltyPoints')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: relationships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching referral relationships:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch relationships' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { relationshipId, isActive } = await request.json()

    await connectToDatabase()

    const relationship = await ReferralRelationship.findByIdAndUpdate(
      relationshipId,
      { isActive },
      { new: true }
    ).populate('referrer', 'firstName lastName email')
      .populate('referred', 'firstName lastName email')

    if (!relationship) {
      return NextResponse.json({ success: false, error: 'Relationship not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: relationship,
      message: `Relationship ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error('Error updating referral relationship:', error)
    return NextResponse.json({ success: false, error: 'Failed to update relationship' }, { status: 500 })
  }
}
