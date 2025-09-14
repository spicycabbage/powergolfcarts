import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import LoyaltyReward from '@/lib/models/LoyaltyReward'

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const rewards = await LoyaltyReward.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: rewards })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load rewards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const value = Number(body?.value)
    const pointsCost = Number(body?.pointsCost)
    const validDays = body?.validDays != null ? Number(body.validDays) : undefined
    if (!name || !Number.isFinite(value) || !Number.isFinite(pointsCost)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }
    const doc = await LoyaltyReward.create({ name, value, pointsCost, validDays, isActive: body?.isActive !== false })
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create reward' }, { status: 500 })
  }
}


