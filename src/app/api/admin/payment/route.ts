import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import PaymentSettings from '@/lib/models/PaymentSettings'

async function ensureDoc() {
  const existing = await PaymentSettings.findOne()
  if (existing) return existing
  return PaymentSettings.create({})
}

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const doc = await ensureDoc()
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin payment GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to load payment settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const body = await req.json()
    const doc = await ensureDoc()
    doc.etransfer = {
      enabled: Boolean(body?.etransfer?.enabled),
      note: String(body?.etransfer?.note || '')
    } as any
    // Ensure legacy email field is removed from persisted document
    try { (doc as any).etransfer && delete (doc as any).etransfer.email } catch {}
    await doc.save()
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin payment PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to save payment settings' }, { status: 500 })
  }
}


