import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import LoyaltyReward from '@/lib/models/LoyaltyReward'
import User from '@/lib/models/User'
import Coupon from '@/lib/models/Coupon'

function generateCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)]
  return s
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectToDatabase()
    const body = await req.json()
    const rewardId = String(body?.rewardId || '')
    if (!rewardId) return NextResponse.json({ success: false, error: 'rewardId required' }, { status: 400 })
    const reward: any = await LoyaltyReward.findById(rewardId).lean()
    if (!reward || reward.isActive === false) return NextResponse.json({ success: false, error: 'Reward unavailable' }, { status: 400 })
    const user: any = await User.findById(session.user.id)
    const cost = Number(reward.pointsCost || 0)
    if (Number(user?.loyaltyPoints || 0) < cost) return NextResponse.json({ success: false, error: 'Not enough points' }, { status: 400 })

    // Deduct points
    user.loyaltyPoints = Math.max(0, Number(user.loyaltyPoints || 0) - cost) as any
    await user.save()

    // Create single-use coupon code and attach to user
    const code = generateCode()
    const now = new Date()
    const validUntil = reward.validDays ? new Date(now.getTime() + reward.validDays*24*60*60*1000) : new Date(now.getTime() + 30*24*60*60*1000)
    const created = await Coupon.create({
      code,
      name: `${reward.name}`,
      type: 'fixed',
      value: Number(reward.value || 0),
      usageLimit: 1,
      userUsageLimit: 1,
      validFrom: now,
      validUntil,
      isActive: true,
      createdBy: session.user.id,
    })
    try { user.loyaltyCoupons = Array.isArray(user.loyaltyCoupons) ? user.loyaltyCoupons : []; user.loyaltyCoupons.push({ code, value: created.value, createdAt: new Date() } as any); await user.save() } catch {}
    return NextResponse.json({ success: true, data: { code, value: created.value, validUntil, pointsSpent: cost } })
  } catch (e) {
    console.error('Redeem error', e)
    return NextResponse.json({ success: false, error: 'Failed to redeem' }, { status: 500 })
  }
}


