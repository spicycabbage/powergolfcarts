import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'

// GET /api/admin/pages?search=&page=1&limit=20
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
      Page.find(q).sort({ updatedAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
      Page.countDocuments(q)
    ])
    return NextResponse.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } })
  } catch (e) {
    console.error('Admin pages GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST /api/admin/pages
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await req.json()
    const { title, slug, content, seo, isPublished } = body
    if (!title || String(title).trim() === '') return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    const page = new Page({ title, slug, content: String(content||''), seo, isPublished: !!isPublished })
    await page.save()
    return NextResponse.json({ success: true, data: page }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    console.error('Admin pages POST error:', e)
    return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 })
  }
}



