import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { sendPasswordResetEmail } from '@/lib/emailService'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Forgot password API called')
    const { email } = await request.json()
    console.log('📧 Email received:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    console.log('🔌 Connecting to database...')
    await connectToDatabase()
    console.log('✅ Database connected')

    // Find user by email
    console.log('👤 Looking for user with email:', email.toLowerCase().trim())
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isActive: true 
    })
    console.log('👤 User found:', !!user)

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      // Save reset token to user
      user.resetPasswordToken = resetToken
      user.resetPasswordExpires = resetTokenExpiry
      await user.save()

      try {
        // Send reset email
        await sendPasswordResetEmail(user.email, resetToken, user.firstName)
        console.log(`Password reset email would be sent to: ${user.email}`)
        console.log(`Reset token: ${resetToken}`)
        console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError)
        
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again later.' },
          { status: 500 }
        )
      }
    } else {
      console.log(`Password reset requested for non-existent email: ${email}`)
    }

    // Always return success message for security
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
