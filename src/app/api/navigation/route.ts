import { NextResponse } from 'next/server'
import { getNavigationConfig } from '@/lib/navigationStore'

// Public navigation endpoint (no auth required)
export async function GET() {
  try {
    const navigationConfig = await getNavigationConfig()
    return NextResponse.json(navigationConfig)
  } catch (error) {
    console.error('Navigation fetch error:', error)
    const navigationConfig = await getNavigationConfig()
    return NextResponse.json(navigationConfig)
  }
}
