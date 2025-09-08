import { NextRequest, NextResponse } from 'next/server'
import { getShippingSettings } from '@/lib/shippingStore'

export async function GET(_req: NextRequest) {
  try {
    const doc = await getShippingSettings()
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Public shipping GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch shipping settings' }, { status: 500 })
  }
}


