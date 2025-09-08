import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await connectToDatabase()
    const doc = await Post.findById(id).lean()
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin post GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await connectToDatabase()
    const body = await req.json()
    const { title, slug, excerpt, content, coverImage, tags, topic, seo, isPublished, publishedAt } = body || {}
    if (!title || !slug) {
      return NextResponse.json({ success: false, error: 'Missing title or slug' }, { status: 400 })
    }
    const doc = await Post.findByIdAndUpdate(id, {
      $set: {
        title,
        slug,
        excerpt: excerpt || '',
        content: content || '',
        coverImage,
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.trim() ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
        topic: typeof topic === 'string' ? topic.trim().toLowerCase() : undefined,
        seo,
        isPublished: !!isPublished,
        publishedAt: isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      }
    }, { new: true })
    return NextResponse.json({ success: true, data: doc })
  } catch (e: any) {
    console.error('Admin post PUT error:', e)
    const msg = e?.message?.includes('duplicate key') ? 'Slug already exists' : 'Failed to update post'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await connectToDatabase()
    await Post.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin post DELETE error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}



