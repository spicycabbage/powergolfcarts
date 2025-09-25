import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'

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
    const status = searchParams.get('status') // 'pending', 'awarded', 'cancelled'

    await connectToDatabase()
    
    const Referral = (await import('@/models/Referral')).default
    
    let query: any = {}
    if (status && ['pending', 'awarded', 'cancelled'].includes(status)) {
      query.status = status
    }

    const total = await Referral.countDocuments(query)
    const referrals = await Referral.find(query)
      .populate('referrer', 'firstName lastName email referralCode')
      .populate('referred', 'firstName lastName email')
      .populate('order', 'invoiceNumber createdAt total')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin referrals GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}
