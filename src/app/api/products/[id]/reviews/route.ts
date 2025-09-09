import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Review from '@/lib/models/Review'
import Product from '@/lib/models/Product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    await connectToDatabase()

    // Get reviews for this product
    const reviews = await Review.find({ 
      product: id, 
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('customerName customerEmail rating comment createdAt helpfulCount')
      .lean()

    // Get total count and stats
    const totalReviews = await Review.countDocuments({ 
      product: id, 
      isApproved: true 
    })

    const stats = await Review.aggregate([
      { $match: { product: id, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingBreakdown: {
            $push: '$rating'
          }
        }
      }
    ])

    const averageRating = stats[0]?.averageRating || 0
    const ratingBreakdown = stats[0]?.ratingBreakdown || []
    
    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratingBreakdown.filter((r: number) => r === rating).length,
      percentage: totalReviews > 0 ? (ratingBreakdown.filter((r: number) => r === rating).length / totalReviews) * 100 : 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...review,
          _id: review._id?.toString() || review._id,
          user: {
            name: review.customerName || 'Anonymous',
            firstName: review.customerName?.split(' ')[0] || 'Anonymous'
          }
        })),
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          distribution
        },
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { rating, comment, title } = body

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this product (if logged in)
    if (session?.user?.id) {
      const existingReview = await Review.findOne({
        product: id,
        user: session.user.id
      })

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        )
      }
    }

    // Create review
    const review = new Review({
      product: id,
      user: session?.user?.id || null,
      customerName: session?.user?.name || 'Anonymous',
      customerEmail: session?.user?.email || '',
      rating: parseInt(rating),
      comment: comment.trim(),
      title: title?.trim() || '',
      isApproved: true, // Auto-approve for now
      isVerifiedPurchase: false // Could check order history later
    })

    await review.save()

    // Update product rating stats
    const stats = await Review.aggregate([
      { $match: { product: id, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ])

    if (stats[0]) {
      await Product.findByIdAndUpdate(id, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].totalReviews
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      stats: stats[0] ? {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      } : null
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}