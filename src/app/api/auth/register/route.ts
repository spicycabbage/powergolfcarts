import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8)

    // Generate unique referral code
    const generateReferralCode = async () => {
      const baseCode = firstName.substring(0, 4).toUpperCase()
      let attempts = 0
      
      while (attempts < 10) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const referralCode = baseCode + randomSuffix
        
        // Check if code already exists
        const existing = await User.findOne({ referralCode })
        if (!existing) {
          return referralCode
        }
        attempts++
      }
      
      // Fallback to completely random code
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    const referralCode = await generateReferralCode()

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      referralCode,
      addresses: [],
      orders: [],
      wishlist: []
    })

    // Return success (exclude password)
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}