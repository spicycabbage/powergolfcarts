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
    const userDoc: any = await User.findById(session.user.id).select('email firstName lastName loyaltyPoints loyaltyCoupons')
    if (!userDoc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    let points = Number(userDoc.loyaltyPoints || 0)
    if (!Number.isFinite(points) || points < 0) points = 0
    // Reconcile from orders if points look out of date
    if (points === 0) {
      const { default: Order } = await import('@/lib/models/Order')
      const agg = await Order.aggregate([
        { $match: { user: userDoc._id, loyaltyPointsAwarded: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$loyaltyPoints', 0] } } } }
      ])
      const computed = Number(agg?.[0]?.total || 0)
      if (computed > 0) {
        userDoc.loyaltyPoints = computed
        await userDoc.save()
        points = computed
      }
    }
    const coupons = Array.isArray(userDoc.loyaltyCoupons) ? userDoc.loyaltyCoupons.map((c: any) => ({ code: c.code, value: Number(c.value||0), createdAt: c.createdAt, usedAt: c.usedAt || null })) : []
    const payload = { email: userDoc.email, firstName: userDoc.firstName, lastName: userDoc.lastName, loyaltyPoints: points, loyaltyCoupons: coupons }
    return NextResponse.json({ success: true, data: payload })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load user' }, { status: 500 })
  }
}


