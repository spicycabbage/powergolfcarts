import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    const { slug } = params
    const doc = await Post.findOne({ slug, isPublished: true }).lean()
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Public post GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 })
  }
}



