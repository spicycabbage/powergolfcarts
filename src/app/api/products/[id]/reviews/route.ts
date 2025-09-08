import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Review from '@/lib/models/Review'

// GET /api/products/[id]/reviews?sort=newest&page=1&limit=10
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await context.params

    const url = new URL(request.url)
    const sort = (url.searchParams.get('sort') as any) || 'newest'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const exists = await Product.exists({ _id: id })
    if (!exists) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Include legacy reviews (without status) by NOT filtering here and letting model include approved only; but for retrieving, admin endpoint handles legacy.
    const { reviews, pagination } = await (Review as any).getProductReviews(id, page, limit, sort)
    const stats = await (Review as any).getProductRatingStats(id)

    return NextResponse.json({ success: true, data: { reviews, pagination, stats } })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/products/[id]/reviews
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const product = await Product.findById(id).select('_id')
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const rating = Number(body.rating)
    const title = body.title != null ? String(body.title || '').trim() : undefined
    const comment = String(body.comment || '').trim()
    const images = Array.isArray(body.images) ? body.images.slice(0, 5) : []

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 })
    }
    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment is required' }, { status: 400 })
    }

    // Create or update existing review (one per user per product)
    const userId = session.user.id
    const existing = await Review.findOne({ user: userId, product: product._id })
    if (existing) {
      existing.rating = rating
      if (title !== undefined) existing.title = title
      existing.comment = comment
      existing.images = images
      existing.status = 'pending' // re-approve after edits
      await existing.save()
    } else {
      await Review.create({
        user: userId,
        product: product._id,
        rating,
        ...(title !== undefined ? { title } : {}),
        comment,
        images,
        isVerified: false,
        status: 'pending',
      })
    }

    // Return fresh stats after create
    const stats = await (Review as any).getProductRatingStats(String(product._id))
    // Also update Product's averageRating/reviewCount for faster reads
    const agg = await Review.aggregate([
      { $match: { product: product._id, reported: false, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
    ])
    const avg = agg[0]?.avg || 0
    const cnt = agg[0]?.cnt || 0
    await Product.findByIdAndUpdate(product._id, { averageRating: Math.round(avg * 10) / 10, reviewCount: cnt })
    return NextResponse.json({ success: true, message: 'Review submitted', stats })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 })
  }
}


