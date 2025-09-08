import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      return NextResponse.json(
        { message: 'New password must contain at least one lowercase letter' },
        { status: 400 }
      )
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return NextResponse.json(
        { message: 'New password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { message: 'New password must contain at least one number' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    let isCurrentPasswordValid = false
    if (user.password && user.password.startsWith('$2')) {
      // Password is hashed with bcrypt
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    } else {
      // Password is stored as plain text (legacy support)
      isCurrentPasswordValid = currentPassword === user.password
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

