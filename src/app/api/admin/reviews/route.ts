import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Review from '@/lib/models/Review'
import Product from '@/lib/models/Product'

// GET /api/admin/reviews?status=pending&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') as any) || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const q: any = {}
    if (status === 'approved') q.isApproved = true
    else if (status === 'rejected') q.isApproved = false
    else if (status === 'pending') q.isApproved = { $exists: false }
    const [items, total] = await Promise.all([
      Review.find(q)
        .populate('user', 'firstName lastName email')
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(q)
    ])
    return NextResponse.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (e) {
    console.error('Admin reviews GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// PUT /api/admin/reviews - update status or content
export async function PUT(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await req.json()
    const { id, status, title, comment, rating } = body
    const update: any = {}
    if (status) {
      if (status === 'approved') update.isApproved = true
      else if (status === 'rejected') update.isApproved = false
    }
    if (title != null) update.title = String(title)
    if (comment != null) update.comment = String(comment)
    if (rating != null) update.rating = Number(rating)
    const doc = await Review.findByIdAndUpdate(id, update, { new: true })
    if (!doc) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    // If status changed to approved/rejected, recompute product stats
    if (update.isApproved !== undefined) {
      const productId = (doc as any).product
      const agg = await Review.aggregate([
        { $match: { product: productId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
      ])
      const avg = agg[0]?.avg || 0
      const cnt = agg[0]?.cnt || 0
      await Product.findByIdAndUpdate(productId, { averageRating: Math.round(avg * 10) / 10, reviewCount: cnt })
    }
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin reviews PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    const result = await Review.findByIdAndDelete(id)
    if (!result) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    // Recompute product stats after deletion
    const productId = (result as any).product
    if (productId) {
      const agg = await Review.aggregate([
        { $match: { product: productId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
      ])
      const avg = agg[0]?.avg || 0
      const cnt = agg[0]?.cnt || 0
      await Product.findByIdAndUpdate(productId, { averageRating: Math.round(avg * 10) / 10, reviewCount: cnt })
    }
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e) {
    console.error('Admin reviews DELETE error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}


