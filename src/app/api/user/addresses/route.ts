import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id).select('addresses')

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user.addresses || [])

  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addressData = await request.json()
    const { type, firstName, lastName, company, address1, address2, city, state, postalCode, country, phone, isDefault } = addressData

    // Validation
    if (!type || !firstName || !lastName || !address1 || !city || !state || !postalCode || !country) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['shipping', 'billing'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid address type' },
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

    // If this is set as default, unset other defaults of the same type
    if (isDefault) {
      user.addresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: addr.type === type ? false : addr.isDefault
      }))
    }

    // Create new address
    const newAddress = {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: isDefault || false
    }

    user.addresses.push(newAddress)
    await user.save()

    return NextResponse.json({
      message: 'Address added successfully',
      address: newAddress
    })

  } catch (error) {
    console.error('Add address error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

