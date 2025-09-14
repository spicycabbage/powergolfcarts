import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Coupon from '@/lib/models/Coupon'
import { createSuccessResponse, createErrorResponse } from '@/utils/apiResponse'

// GET /api/admin/coupons/[id] - Get single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401)
    }

    await connectToDatabase()
    const { id } = await params

    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'firstName lastName')
      .lean()

    if (!coupon) {
      return createErrorResponse('Coupon not found', 404)
    }

    return createSuccessResponse(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return createErrorResponse('Failed to fetch coupon', 500)
  }
}

// PATCH /api/admin/coupons/[id] - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    await connectToDatabase()
    const { id } = await params

    const coupon = await Coupon.findById(id)
    if (!coupon) {
      return createErrorResponse('Coupon not found', 404)
    }

    // Update coupon fields
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        coupon[key] = body[key]
      }
    })

    await coupon.save()

    const updatedCoupon = await Coupon.findById(id)
      .populate('createdBy', 'firstName lastName')
      .lean()

    return createSuccessResponse(updatedCoupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return createErrorResponse('Failed to update coupon', 500)
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return createErrorResponse('Unauthorized', 401)
    }

    await connectToDatabase()
    const { id } = await params

    const coupon = await Coupon.findById(id)
    if (!coupon) {
      return createErrorResponse('Coupon not found', 404)
    }

    // Check if coupon has been used
    if (coupon.usageCount > 0) {
      return createErrorResponse('Cannot delete coupon that has been used', 400)
    }

    await Coupon.findByIdAndDelete(id)

    return createSuccessResponse({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return createErrorResponse('Failed to delete coupon', 500)
  }
}
