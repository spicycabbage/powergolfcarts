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

    if (!categoryData || typeof categoryData.name !== 'string' || categoryData.name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
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

    // Prevent creating another system category
    if (categoryData.slug === 'uncategorized' || (categoryData.name && String(categoryData.name).toLowerCase() === 'uncategorized')) {
      return NextResponse.json({ error: 'Uncategorized is reserved' }, { status: 400 })
    }

    // Ensure unique slug (auto-increment suffix -2, -3, ... if needed)
    const baseSlug = categoryData.slug
    let uniqueSlug = baseSlug
    let counter = 2
    // Loop until slug is unique
    while (await Category.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter += 1
    }
    categoryData.slug = uniqueSlug

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
    return NextResponse.json({ error: 'Failed to create category', details: error?.message || 'Unknown error' }, { status: 500 })
  }
}
