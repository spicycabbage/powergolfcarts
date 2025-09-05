import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

// Public: GET /api/blog?tag=&page=1&limit=5
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const tag = (searchParams.get('tag') || '').trim()
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '5', 10) || 5, 1), 50)
    const q: any = { isPublished: true }
    if (tag) q.tags = { $elemMatch: { $regex: `^${tag}$`, $options: 'i' } }
    const [items, total] = await Promise.all([
      Post.find(q).sort({ publishedAt: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Post.countDocuments(q)
    ])
    return NextResponse.json({ success: true, data: items, pagination: { page, limit, total } })
  } catch (e) {
    console.error('Public blog GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 })
  }
}


