import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import PaymentSettings from '@/lib/models/PaymentSettings'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const doc = await PaymentSettings.findOne().lean()
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Payment public GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to load payment settings' }, { status: 500 })
  }
}


