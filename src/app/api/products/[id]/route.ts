import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Review from '@/lib/models/Review'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    await connectToDatabase()

    const { id } = context.params as { id: string }
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
    const reviewStats = await Review.getProductRatingStats(params.id)

    // Add virtual fields
    const productWithVirtuals = {
      ...product.toObject(),
      discountPercentage: product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
      stockStatus: !product.inventory.trackInventory
        ? 'in_stock'
        : product.inventory.quantity === 0
        ? 'out_of_stock'
        : product.inventory.quantity <= product.inventory.lowStockThreshold
        ? 'low_stock'
        : 'in_stock',
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
  context: { params: Record<string, string | string[]> }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const updateData = { ...body, updatedAt: new Date() }

    const { id } = context.params as { id: string }
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
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    await connectToDatabase()

    const { id } = context.params as { id: string }
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


