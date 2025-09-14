import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import LoyaltyReward from '@/lib/models/LoyaltyReward'

export async function GET() {
  try {
    await connectToDatabase()
    let rewards = await LoyaltyReward.find({ isActive: true }).sort({ pointsCost: 1 }).lean()
    if (!rewards || rewards.length === 0) {
      // Seed defaults: 400 pts -> $20, 1000 pts -> $50
      await LoyaltyReward.create([
        { name: '$20 Coupon', value: 20, pointsCost: 400, validDays: 30, isActive: true },
        { name: '$50 Coupon', value: 50, pointsCost: 1000, validDays: 30, isActive: true },
      ])
      rewards = await LoyaltyReward.find({ isActive: true }).sort({ pointsCost: 1 }).lean()
    }
    return NextResponse.json({ success: true, data: rewards })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load rewards' }, { status: 500 })
  }
}


