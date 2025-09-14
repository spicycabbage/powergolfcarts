import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const user = await User.findById(session.user.id).select('email firstName lastName loyaltyPoints').lean()
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load user' }, { status: 500 })
  }
}


