import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Post image upload started')
    
    const session: any = await getServerSession(authOptions as any)
    console.log('Session check:', session?.user?.role)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      console.log('❌ Unauthorized upload attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    
    if (!file) {
      console.log('❌ No file in form data')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    console.log('File received:', {
      name: (file as any).name,
      type: file.type,
      size: file.size
    })
    
    if (!file.type?.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (file.size > 4 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('Buffer created, size:', buffer.length)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
    console.log('Upload directory path:', uploadsDir)
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...')
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const originalName = (file as any).name || 'post'
    const extFromName = path.extname(originalName)
    const extFromType = file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : ''
    const ext = extFromName || extFromType || '.png'

    // Preserve SEO-friendly filename, just add timestamp to avoid conflicts
    const baseName = path.basename(originalName, extFromName)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    
    const filename = `${baseName}-${Date.now()}${ext}`
    const filepath = path.join(uploadsDir, filename)
    
    console.log('Writing file to:', filepath)
    fs.writeFileSync(filepath, buffer)
    console.log('✅ File written successfully')

    const publicUrl = `/uploads/posts/${filename}`
    console.log('✅ Upload complete, URL:', publicUrl)
    
    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('❌ Post image upload API error:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Failed to upload image', 
      details: error?.message || String(error) 
    }, { status: 500 })
  }
}



