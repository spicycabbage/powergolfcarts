import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit') || 10)))
    const skip = (page - 1) * limit

    await connectToDatabase()
    
    const Referral = (await import('@/models/Referral')).default
    const User = (await import('@/lib/models/User')).default
    const Order = (await import('@/lib/models/Order')).default
    
    // Get user's referral code
    const user = await User.findById(session.user.id).select('referralCode')
    
    // Convert user ID to ObjectId for proper MongoDB matching
    const userObjectId = new mongoose.Types.ObjectId(session.user.id)
    
    // Get referrals made by this user
    const total = await Referral.countDocuments({ referrer: userObjectId })
    const referrals = await Referral.find({ referrer: userObjectId })
      .populate('referred', 'firstName lastName')
      .populate('order', 'invoiceNumber createdAt total')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Calculate totals
    console.log(`🔍 API Debug - User ID: ${session.user.id}, Email: ${session.user.email}`)
    
    const totalPointsEarned = await Referral.aggregate([
      { $match: { referrer: userObjectId, status: 'awarded' } },
      { $group: { _id: null, total: { $sum: '$loyaltyPointsAwarded' } } }
    ])
    
    console.log(`📊 API Debug - Aggregation result:`, totalPointsEarned)
    console.log(`📊 API Debug - Points to return:`, totalPointsEarned[0]?.total || 0)

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user?.referralCode || null,
        referrals,
        stats: {
          totalReferrals: total,
          totalPointsEarned: totalPointsEarned[0]?.total || 0,
          activeReferrals: referrals.filter((r: any) => r.status === 'awarded').length
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('My referrals GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}
