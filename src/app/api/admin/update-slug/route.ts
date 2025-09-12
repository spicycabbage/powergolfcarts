import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, newSlug } = await request.json()
    
    if (!productId || !newSlug) {
      return NextResponse.json({ error: 'Product ID and new slug are required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Check if slug is already taken by another product
    const existingProduct = await Product.findOne({ 
      slug: newSlug,
      _id: { $ne: new mongoose.Types.ObjectId(productId) }
    })
    
    if (existingProduct) {
      return NextResponse.json({ 
        error: `Slug "${newSlug}" is already taken by "${existingProduct.name}"` 
      }, { status: 400 })
    }
    
    // Update the product slug
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { slug: newSlug },
      { new: true }
    )
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        slug: updatedProduct.slug
      }
    })
    
  } catch (error) {
    console.error('Error updating slug:', error)
    return NextResponse.json(
      { error: 'Failed to update slug' },
      { status: 500 }
    )
  }
}
