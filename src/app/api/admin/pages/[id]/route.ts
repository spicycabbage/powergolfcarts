import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { id } = await params
    const page = await Page.findById(id).lean()
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: page })
  } catch (e) {
    console.error('Admin pages [id] GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { id } = await params
    const body = await req.json()
    const update: any = {
      title: body.title,
      content: String(body.content || ''),
      seo: body.seo,
      isPublished: !!body.isPublished,
      updatedAt: new Date()
    }
    if (body.slug) update.slug = String(body.slug).toLowerCase().trim()
    const page = await Page.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: page })
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    console.error('Admin pages [id] PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const { id } = await params
    const page = await Page.findByIdAndDelete(id)
    if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e) {
    console.error('Admin pages [id] DELETE error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete page' }, { status: 500 })
  }
}



