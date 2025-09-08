import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import ShippingSettings from '@/lib/models/ShippingSettings'
import { setShippingSettings, clearShippingSettings } from '@/lib/shippingStore'

async function ensureSettingsDoc() {
  const existing = await ShippingSettings.findOne()
  if (existing) return existing
  return ShippingSettings.create({ freeShippingThreshold: 50, methods: [
    { name: 'Standard', price: 9.99, minDays: 3, maxDays: 7, isActive: true },
    { name: 'Express', price: 19.99, minDays: 1, maxDays: 2, isActive: true },
  ] })
}

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const doc = await ensureSettingsDoc()
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin shipping GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch shipping settings' }, { status: 500 })
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
    const { freeShippingThreshold, methods } = body || {}
    if (freeShippingThreshold == null || freeShippingThreshold < 0 || !Array.isArray(methods)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }
    const doc = await ensureSettingsDoc()
    doc.freeShippingThreshold = Number(freeShippingThreshold)
    doc.methods = methods.map((m: any) => ({
      id: m.id ? String(m.id) : undefined,
      name: String(m.name || ''),
      price: Number(m.price || 0),
      freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : undefined,
      sortOrder: m.sortOrder != null ? Number(m.sortOrder) : 1,
      isActive: Boolean(m.isActive),
      description: m.description ? String(m.description) : undefined,
      _id: m._id || undefined,
    }))
    await doc.save()
    setShippingSettings(doc)
    return NextResponse.json({ success: true, data: doc })
  } catch (e) {
    console.error('Admin shipping PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to update shipping settings' }, { status: 500 })
  }
}


