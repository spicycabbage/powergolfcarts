import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

export const dynamic = 'force-dynamic'
 

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const parent = searchParams.get('parent')
    const featured = searchParams.get('featured') === 'true'
    const fields = searchParams.get('fields')

    const query: any = {}
    if (activeOnly) {
      query.isActive = true
    }
    if (parent) {
      query.parent = parent
    }

    // Build select fields - use provided fields or default
    const selectFields = fields || 'name slug description image parent isActive featuredOnHomepage homepageOrder'

    let categoriesQuery = Category.find(query)
      .select(selectFields)
      .sort({ name: 1 })
    
    // Only apply limit if specified
    if (limit) {
      categoriesQuery = categoriesQuery.limit(limit)
    }

    // For featured categories (homepage), filter by featuredOnHomepage and sort by homepageOrder
    if (featured) {
      categoriesQuery = Category.find({
        ...query,
        featuredOnHomepage: true
      })
        .select(selectFields)
        .sort({ homepageOrder: 1, name: 1 }) // Sort by order first, then name
      
      if (limit) {
        categoriesQuery = categoriesQuery.limit(limit)
      }
    }

    const categories = await categoriesQuery.lean()

    return NextResponse.json({
      success: true,
      categories: categories, // Changed from 'data' to 'categories' to match CategoryGrid
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

