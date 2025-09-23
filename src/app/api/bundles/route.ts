import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Bundle from '@/models/Bundle'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let query = {}
    if (activeOnly) {
      query = { isActive: true }
    }

    const bundles = await Bundle.find(query).sort({ sortOrder: 1, name: 1 })

    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}
