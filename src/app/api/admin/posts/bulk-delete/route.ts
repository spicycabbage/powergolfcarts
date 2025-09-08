import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

// DELETE /api/admin/posts/bulk-delete  { ids: string[] }
export async function DELETE(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as any))
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : []
    if (!ids.length) {
      return NextResponse.json({ success: false, error: 'No ids provided' }, { status: 400 })
    }

    await connectToDatabase()
    const result = await Post.deleteMany({ _id: { $in: ids } })
    return NextResponse.json({ success: true, deletedCount: result?.deletedCount || 0 })
  } catch (e) {
    console.error('Admin posts BULK DELETE error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete posts' }, { status: 500 })
  }
}


