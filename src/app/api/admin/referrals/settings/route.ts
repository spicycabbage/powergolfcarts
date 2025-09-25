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

    await connectToDatabase()
    
    const ReferralSettings = (await import('@/models/ReferralSettings')).default
    const settings = await ReferralSettings.getCurrentSettings()

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Admin referral settings GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    const isAdmin = !!(session && session.user && (session.user as any).role === 'admin')
    
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      pointsPerDollarSpent,
      minimumOrderAmount,
      maxPointsPerReferral,
      linkExpiryDays,
      isActive,
      termsAndConditions
    } = body

    await connectToDatabase()
    
    const ReferralSettings = (await import('@/models/ReferralSettings')).default
    let settings = await ReferralSettings.findOne()
    
    if (!settings) {
      settings = new ReferralSettings()
    }

    // Update settings
    if (typeof pointsPerDollarSpent === 'number') settings.pointsPerDollarSpent = Math.max(0.1, Math.min(10, pointsPerDollarSpent))
    if (typeof minimumOrderAmount === 'number') settings.minimumOrderAmount = Math.max(0, minimumOrderAmount)
    if (typeof maxPointsPerReferral === 'number') settings.maxPointsPerReferral = maxPointsPerReferral > 0 ? maxPointsPerReferral : null
    if (typeof linkExpiryDays === 'number') settings.linkExpiryDays = Math.max(1, linkExpiryDays)
    if (typeof isActive === 'boolean') settings.isActive = isActive
    if (typeof termsAndConditions === 'string') settings.termsAndConditions = termsAndConditions

    await settings.save()

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Admin referral settings PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update referral settings' },
      { status: 500 }
    )
  }
}
