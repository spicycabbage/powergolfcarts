import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Review from '@/lib/models/Review'
import { addProductVirtuals } from '@/lib/utils/product'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('categories', 'name slug description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get review statistics
    const reviews = await Review.find({ product: id, isApproved: true }).lean()
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0
    const reviewStats = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    }

    // Add virtual fields using utility functions
    const productWithVirtuals = {
      ...addProductVirtuals(product.toObject()),
      reviewStats
    }

    return NextResponse.json({
      success: true,
      data: productWithVirtuals
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const toNum = (val: any) => {
      if (val === null || val === undefined) return undefined
      const raw = typeof val === 'string' ? val.trim() : val
      if (raw === '') return undefined
      const num = Number(raw)
      return Number.isFinite(num) ? num : undefined
    }

    // Normalize pricing on update: originalPrice = Regular, price = Sales (optional)
    let regularPrice = toNum(body.originalPrice)
    let salesPrice = toNum(body.price)
    if (regularPrice != null && salesPrice != null) {
      if (salesPrice >= regularPrice) {
        return NextResponse.json(
          { success: false, error: 'Sales Price must be less than Regular Price' },
          { status: 400 }
        )
      }
    }

    // Normalize variant pricing similarly
    const normalizedVariants = Array.isArray(body.variants)
      ? body.variants.map((v: any) => {
          const vRegular = toNum(v.originalPrice)
          const vSale = toNum(v.price)
          if (vRegular != null && vSale != null && vSale >= vRegular) {
            throw new Error('Variant Sales Price must be less than Regular Price')
          }
          return { ...v, originalPrice: vRegular, price: vSale }
        })
      : body.variants

    const isVariable = (body.productType || (Array.isArray(normalizedVariants) && normalizedVariants.length > 0 ? 'variable' : 'simple')) === 'variable'

    // Derive top-level pricing if needed
    if (isVariable && Array.isArray(normalizedVariants) && normalizedVariants.length > 0) {
      const effectiveCandidatePrices = normalizedVariants.map((v: any) => {
        const val = v.price != null ? Number(v.price) : (v.originalPrice != null ? Number(v.originalPrice) : NaN)
        return Number.isFinite(val) ? val : NaN
      })
      const effectivePrices: number[] = effectiveCandidatePrices.filter((n: number): n is number => Number.isFinite(n))

      const regularCandidatePrices = normalizedVariants.map((v: any) => {
        const val = v.originalPrice != null ? Number(v.originalPrice) : (v.price != null ? Number(v.price) : NaN)
        return Number.isFinite(val) ? val : NaN
      })
      const regulars: number[] = regularCandidatePrices.filter((n: number): n is number => Number.isFinite(n))
      if (effectivePrices.length > 0) {
        salesPrice = Math.min(...effectivePrices)
      }
      if (regulars.length > 0) {
        regularPrice = Math.min(...regulars)
      }
    } else if (!isVariable) {
      // For simple products: if only regular provided, make it effective price too
      if (regularPrice != null && salesPrice == null) {
        salesPrice = regularPrice
      }
    }

    const updateData: any = {
      ...body,
      updatedAt: new Date()
    }
    // Guard: ensure description fields are strings
    if (typeof updateData.description !== 'string') updateData.description = String(updateData.description || '')
    if (typeof updateData.shortDescription !== 'string') updateData.shortDescription = String(updateData.shortDescription || '')
    // Ensure we don't unset price/originalPrice unless we have derived values
    if (salesPrice !== undefined) updateData.price = salesPrice
    else delete updateData.price
    if (regularPrice !== undefined) updateData.originalPrice = regularPrice
    else delete updateData.originalPrice
    if (Array.isArray(normalizedVariants)) updateData.variants = normalizedVariants

    const { id } = await context.params
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error: any) {
    console.error('Error updating product:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}


