import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const query: any = q ? { email: { $regex: q, $options: 'i' } } : {}
    const [users, total] = await Promise.all([
      User.find(query).select('email firstName lastName loyaltyPoints createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ])
    return NextResponse.json({ success: true, data: users, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const body = await req.json()
    const userId = String(body?.userId || '')
    const delta = Number(body?.delta)
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
    if (!Number.isFinite(delta)) return NextResponse.json({ success: false, error: 'delta must be a number' }, { status: 400 })
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    const next = Math.max(0, Number(user.loyaltyPoints || 0) + delta)
    user.loyaltyPoints = next as any
    await user.save()
    return NextResponse.json({ success: true, data: { userId, loyaltyPoints: next } })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update points' }, { status: 500 })
  }
}


