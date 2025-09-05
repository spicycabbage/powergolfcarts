import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

// GET /api/admin/posts?search=&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const q: any = search ? { $text: { $search: search } } : {}
    const [items, total] = await Promise.all([
      Post.find(q).sort({ publishedAt: -1, updatedAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
      Post.countDocuments(q)
    ])
    return NextResponse.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } })
  } catch (e) {
    console.error('Admin posts GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/admin/posts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await req.json()
    const { title, slug, excerpt, content, coverImage, tags, seo, isPublished, publishedAt } = body || {}
    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Missing title or slug' }, { status: 400 })
    }
    const doc = await Post.create({
      title,
      slug,
      excerpt: excerpt || '',
      content: content || '',
      coverImage,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.trim() ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      seo,
      isPublished: !!isPublished,
      publishedAt: isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
    })
    return NextResponse.json({ success: true, data: doc })
  } catch (e: any) {
    console.error('Admin posts POST error:', e)
    const msg = e?.message?.includes('duplicate key') ? 'Slug already exists' : 'Failed to create post'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}



