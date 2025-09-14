import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import LoyaltyConfig from '@/lib/models/LoyaltyConfig'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const cfg = await LoyaltyConfig.findOne().lean()
    return NextResponse.json({ success: true, data: cfg || { pointsPerDollar: 1 } })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load config' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const body = await req.json()
    const p = Number(body?.pointsPerDollar)
    if (!Number.isFinite(p) || p < 0) return NextResponse.json({ success: false, error: 'Invalid pointsPerDollar' }, { status: 400 })
    const doc = await LoyaltyConfig.findOneAndUpdate({}, { $set: { pointsPerDollar: p, updatedBy: session.user.id } }, { new: true, upsert: true })
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to save config' }, { status: 500 })
  }
}


