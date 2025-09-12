import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'

// Generate slug function (matches Product model)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Get all products
    const products = await Product.find({})
      .select('name slug isActive')
      .lean()
    
    // Find products with slug issues
    const issues = []
    
    for (const product of products) {
      const expectedSlug = generateSlug(product.name)
      
      if (product.slug !== expectedSlug) {
        issues.push({
          _id: product._id.toString(),
          name: product.name,
          currentSlug: product.slug,
          expectedSlug,
          isActive: product.isActive
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      issues,
      total: products.length,
      issueCount: issues.length
    })
    
  } catch (error) {
    console.error('Error fetching slug issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slug issues' },
      { status: 500 }
    )
  }
}
