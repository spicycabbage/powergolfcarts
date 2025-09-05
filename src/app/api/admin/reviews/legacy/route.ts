import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Review from '@/lib/models/Review'

// GET /api/admin/reviews/legacy - find old reviews missing status field
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const items = await Review.find({ $or: [{ status: { $exists: false } }, { status: null }] })
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ success: true, data: items })
  } catch (e) {
    console.error('Legacy reviews GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch legacy reviews' }, { status: 500 })
  }
}

// PUT /api/admin/reviews/legacy - migrate one or many legacy reviews to a given status
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await req.json()
    const { ids, status } = body
    if (!Array.isArray(ids) || !status) return NextResponse.json({ success: false, error: 'Missing ids/status' }, { status: 400 })
    await Review.updateMany({ _id: { $in: ids } }, { $set: { status } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Legacy reviews PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to update legacy reviews' }, { status: 500 })
  }
}



