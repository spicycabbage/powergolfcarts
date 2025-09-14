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

    const raw = await request.json()
    await connectToDatabase()
    const { id } = await params

    // Load document and update explicitly to leverage doc validators
    const coupon = await Coupon.findById(id)
    if (!coupon) {
      return createErrorResponse('Coupon not found', 404)
    }

    // Ensure code uniqueness when changed
    if (raw.code != null) {
      const newCode = String(raw.code).toUpperCase()
      const exists = await Coupon.findOne({ code: newCode, _id: { $ne: id } }).select('_id')
      if (exists) {
        return createErrorResponse('Coupon code already exists', 400)
      }
      coupon.code = newCode as any
      coupon.name = (raw.name != null ? String(raw.name) : coupon.code) as any
    } else if (raw.name != null) {
      coupon.name = String(raw.name) as any
    }

    if (raw.description != null) coupon.description = String(raw.description) as any
    if (raw.type != null) coupon.type = String(raw.type) as any
    if (raw.value != null) coupon.value = Number(raw.value) as any
    if (raw.minimumOrderAmount != null) coupon.minimumOrderAmount = Number(raw.minimumOrderAmount) as any
    if (raw.maximumDiscountAmount != null) coupon.maximumDiscountAmount = Number(raw.maximumDiscountAmount) as any
    if (raw.usageLimit != null) coupon.usageLimit = Number(raw.usageLimit) as any
    if (raw.userUsageLimit != null) coupon.userUsageLimit = Number(raw.userUsageLimit) as any
    if (raw.validFrom != null) coupon.validFrom = new Date(raw.validFrom) as any
    if (raw.validUntil != null) coupon.validUntil = new Date(raw.validUntil) as any
    if (raw.isActive != null) coupon.isActive = Boolean(raw.isActive) as any
    if (Array.isArray(raw.applicableCategories)) coupon.applicableCategories = raw.applicableCategories as any
    if (Array.isArray(raw.excludedCategories)) coupon.excludedCategories = raw.excludedCategories as any
    if (Array.isArray(raw.applicableProducts)) coupon.applicableProducts = raw.applicableProducts as any
    if (Array.isArray(raw.excludedProducts)) coupon.excludedProducts = raw.excludedProducts as any

    await coupon.save()
    const updatedCoupon = await Coupon.findById(id).populate('createdBy', 'firstName lastName').lean()
    return createSuccessResponse(updatedCoupon as any)
  } catch (error) {
    console.error('Error updating coupon:', error)
    if ((error as any)?.name === 'ValidationError') {
      const msgs = Object.values((error as any).errors || {}).map((e: any) => e?.message).filter(Boolean)
      return createErrorResponse(msgs.join(', ') || 'Validation error', 400)
    }
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
