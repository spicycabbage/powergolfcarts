import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
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

    // Limit ~2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const originalName = (file as any).name || 'logo'
    const extFromName = path.extname(originalName)
    const extFromType = file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : ''
    const ext = extFromName || extFromType || '.png'

    const filename = `logo-${Date.now()}${ext}`
    const filepath = path.join(uploadsDir, filename)
    fs.writeFileSync(filepath, buffer)

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('❌ Logo upload API error:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}




