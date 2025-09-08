import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addressId = params.id
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

    // Find the address to update
    const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults of the same type
    if (isDefault) {
      user.addresses = user.addresses.map((addr: any, index: number) => ({
        ...addr,
        isDefault: addr.type === type && index !== addressIndex ? false : addr.isDefault
      }))
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
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

    await user.save()

    return NextResponse.json({
      message: 'Address updated successfully',
      address: user.addresses[addressIndex]
    })

  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const session: any = await getServerSession(authOptions as any)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addressId = params.id

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Find and remove the address
    const addressIndex = user.addresses.findIndex((addr: any) => addr._id?.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    user.addresses.splice(addressIndex, 1)
    await user.save()

    return NextResponse.json({
      message: 'Address deleted successfully'
    })

  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

