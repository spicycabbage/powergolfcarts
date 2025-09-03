import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { firstName, lastName, email } = await request.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: session.user.id }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        firstName,
        lastName,
        email: email.toLowerCase(),
        // Reset email verification if email changed
        ...(email !== session.user.email && { emailVerified: false })
      },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

