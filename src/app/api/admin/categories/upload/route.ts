import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Limit 4MB
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'categories')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const originalName = (file as any).name || 'category'
    const extFromName = path.extname(originalName)
    const extFromType = file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : ''
    const ext = extFromName || extFromType || '.png'

    const filename = `cat-${Date.now()}${ext}`
    const filepath = path.join(uploadsDir, filename)
    fs.writeFileSync(filepath, buffer)

    const publicUrl = `/uploads/categories/${filename}`

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('❌ Category image upload API error:', error)
    return NextResponse.json({ error: 'Failed to upload category image' }, { status: 500 })
  }
}


