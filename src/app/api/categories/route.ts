import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const parent = searchParams.get('parent')
    const query: any = { isActive: true }
    if (parent) query.parent = parent
    const categories = await Category.find(query)
      .select('name slug parent')
      .sort({ name: 1 })
      .lean()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Public categories fetch error:', error)
    return NextResponse.json([])
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const activeOnly = searchParams.get('active') !== 'false'

    const query: any = {}
    if (activeOnly) {
      query.isActive = true
    }

    const categories = await Category.find(query)
      .select('name slug description image parent')
      .sort({ name: 1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase()

    const body = await request.json()
    const { name, description, image, parent, seo } = body

    // Validate required fields
    if (!name || !seo?.title || !seo?.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if parent category exists (if provided)
    if (parent) {
      const parentCategory = await Category.findById(parent)
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent category' },
          { status: 400 }
        )
      }
    }

    // Create category
    const category = new Category({
      name,
      description,
      image,
      parent,
      seo,
      isActive: true
    })

    const savedCategory = await category.save()

    return NextResponse.json({
      success: true,
      data: savedCategory
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

