import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getShippingSettings } from '@/lib/shippingStore'
import PaymentSettings from '@/lib/models/PaymentSettings'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    // Prime common settings
    await getShippingSettings()
    await PaymentSettings.findOne().lean()
    const origin = request.nextUrl.origin
    // Prime ISR pages so first visitor hits cache
    try {
      await Promise.allSettled([
        fetch(`${origin}/about-us`, { cache: 'no-store' }).catch(() => null),
        fetch(`${origin}/contact`, { cache: 'no-store' }).catch(() => null),
        fetch(`${origin}/blog`, { cache: 'no-store' }).catch(() => null),
        fetch(`${origin}/categories/flowers`, { cache: 'no-store' }).catch(() => null),
        fetch(`${origin}/categories/concentrates`, { cache: 'no-store' }).catch(() => null),
        fetch(`${origin}/categories/hash`, { cache: 'no-store' }).catch(() => null),
      ])
    } catch {}
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Warmup error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


