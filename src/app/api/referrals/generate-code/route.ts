import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Try multiple ways to find the user
    let user = await User.findById(session.user.id)
    
    if (!user) {
      user = await User.findOne({ email: session.user.email })
    }
    
    if (!user) {
      // Create the user if they don't exist
      user = new User({
        email: session.user.email,
        firstName: session.user.name?.split(' ')[0] || 'User',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        loyaltyPoints: 0
      })
      await user.save()
    }

    // If user already has a referral code, return it
    if (user.referralCode) {
      return NextResponse.json({ 
        success: true, 
        referralCode: user.referralCode 
      })
    }

    // Generate new referral code
    const baseCode = (user.firstName || user.email.split('@')[0]).substring(0, 4).toUpperCase()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    let referralCode = baseCode + randomSuffix
    let attempts = 0
    
    // Ensure uniqueness
    while (attempts < 10) {
      const existing = await User.findOne({ referralCode })
      if (!existing) break
      
      // Generate new code
      const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      referralCode = baseCode + newSuffix
      attempts++
    }
    
    if (attempts >= 10) {
      // Fallback to completely random code
      referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    // Save referral code to user
    user.referralCode = referralCode
    await user.save()

    return NextResponse.json({ 
      success: true, 
      referralCode 
    })

  } catch (error) {
    console.error('Generate referral code error:', error)
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}