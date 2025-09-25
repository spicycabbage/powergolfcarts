import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, userAgent, ipAddress } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Find the referrer by their referral code
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
    
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Store referral tracking in session/cookie (handled by client)
    return NextResponse.json({ 
      success: true, 
      referrer: {
        id: referrer._id,
        name: referrer.firstName,
        code: referrer.referralCode
      }
    })

  } catch (error) {
    console.error('Referral tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    )
  }
}

