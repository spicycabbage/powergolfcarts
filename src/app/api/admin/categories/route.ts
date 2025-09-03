import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'
import mongoose from 'mongoose'

// GET - Fetch all categories with hierarchy
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const categories = await Category.find({})
      .populate('children')
      .populate('parent')
      .sort({ name: 1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryData = await request.json()

    await connectToDatabase()

    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }

    // Set default SEO if not provided / normalize keywords
    if (!categoryData.seo) {
      categoryData.seo = {
        title: categoryData.name,
        description: categoryData.description || `Shop ${categoryData.name} products`,
        keywords: [categoryData.name.toLowerCase()]
      }
    } else {
      if (!Array.isArray(categoryData.seo.keywords)) {
        categoryData.seo.keywords = []
      }
    }

    // Validate parent if provided
    if (categoryData.parent === '' || categoryData.parent === null) {
      delete categoryData.parent
    }
    if (categoryData.parent) {
      if (!mongoose.Types.ObjectId.isValid(categoryData.parent)) {
        return NextResponse.json({ error: 'Invalid parent category id' }, { status: 400 })
      }
      const parentExists = await Category.findById(categoryData.parent).select('_id').lean()
      if (!parentExists) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 })
      }
    }

    // Enforce unique slug
    const existing = await Category.findOne({ slug: categoryData.slug }).select('_id').lean()
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 })
    }

    // Normalize parent field
    if (categoryData.parent === '' || categoryData.parent === null) {
      delete categoryData.parent
    }
    const category = new Category(categoryData)
    await category.save()

    // If this category has a parent, add it to parent's children
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $addToSet: { children: category._id }
      })
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Category creation error:', error)
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 })
    }
    if (error?.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
