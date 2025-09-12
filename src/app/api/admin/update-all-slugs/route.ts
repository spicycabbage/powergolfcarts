import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import mongoose from 'mongoose'

// Make slug unique by adding counter if needed
async function makeUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let candidate = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await Product.findOne({ 
      slug: candidate,
      ...(excludeId && { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } })
    })
    
    if (!existing) {
      return candidate
    }
    
    counter++
    candidate = `${baseSlug}-${counter}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { issues } = await request.json()
    
    if (!Array.isArray(issues)) {
      return NextResponse.json({ error: 'Issues array is required' }, { status: 400 })
    }

    await connectToDatabase()
    
    let updated = 0
    let failed = 0
    const results = []
    
    for (const issue of issues) {
      try {
        // Make sure the slug is unique
        const uniqueSlug = await makeUniqueSlug(issue.expectedSlug, issue._id)
        
        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
          issue._id,
          { slug: uniqueSlug },
          { new: true }
        )
        
        if (updatedProduct) {
          updated++
          results.push({
            _id: issue._id,
            name: issue.name,
            oldSlug: issue.currentSlug,
            newSlug: uniqueSlug,
            success: true
          })
        } else {
          failed++
          results.push({
            _id: issue._id,
            name: issue.name,
            error: 'Product not found',
            success: false
          })
        }
      } catch (error) {
        failed++
        results.push({
          _id: issue._id,
          name: issue.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      updated,
      failed,
      results
    })
    
  } catch (error) {
    console.error('Error updating all slugs:', error)
    return NextResponse.json(
      { error: 'Failed to update slugs' },
      { status: 500 }
    )
  }
}
