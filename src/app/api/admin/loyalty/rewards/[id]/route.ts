import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import LoyaltyReward from '@/lib/models/LoyaltyReward'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await connectToDatabase()
    const raw = await req.json()
    const update: any = {}
    if (raw.name != null) update.name = String(raw.name)
    if (raw.value != null) update.value = Number(raw.value)
    if (raw.pointsCost != null) update.pointsCost = Number(raw.pointsCost)
    if (raw.validDays != null) update.validDays = Number(raw.validDays)
    if (raw.isActive != null) update.isActive = Boolean(raw.isActive)
    const doc = await LoyaltyReward.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update reward' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || session.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await connectToDatabase()
    await LoyaltyReward.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete reward' }, { status: 500 })
  }
}


