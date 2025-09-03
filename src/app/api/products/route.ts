import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateRequiredFields,
  parseRequestBody
} from '@/utils/apiResponse'

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const featured = searchParams.get('featured') === 'true'
    const inStock = searchParams.get('inStock') === 'true'

    // Build query
    const query: any = { isActive: true }

    // Category filter
    if (category) {
      if (category.includes(',')) {
        // Multiple categories
        const categoryIds = category.split(',')
        query.$or = [
          { category: { $in: categoryIds } },
          { categories: { $in: categoryIds } }
        ]
      } else {
        query.$or = [
          { category: category },
          { categories: category }
        ]
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search }
    }

    // Price filters
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    // Featured filter
    if (featured) {
      query.isFeatured = true
    }

    // Stock filter
    if (inStock) {
      query['inventory.quantity'] = { $gt: 0 }
      query['inventory.trackInventory'] = true
    }

    // Build sort
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Execute query with pagination
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('categories', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    // Add virtual fields
    const productsWithVirtuals = products.map(product => ({
      ...product,
      discountPercentage: product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
      stockStatus: !product.inventory.trackInventory
        ? 'in_stock'
        : product.inventory.quantity === 0
        ? 'out_of_stock'
        : product.inventory.quantity <= product.inventory.lowStockThreshold
        ? 'low_stock'
        : 'in_stock'
    }))

    return createSuccessResponse(productsWithVirtuals, undefined, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    return handleApiError(error, 'fetching products')
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase()

    const body = await parseRequestBody(request)
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      categories,
      tags,
      inventory,
      seo,
      variants,
      isActive,
      isFeatured
    } = body

    // Normalize SEO: store Focus Keyphrase as first keyword
    const normalizedSeo = {
      title: seo && seo.title ? seo.title : name,
      description: seo && seo.description ? seo.description : (shortDescription || ''),
      keywords: seo && Array.isArray(seo.keywords)
        ? seo.keywords
        : (seo && typeof seo.keywords === 'string' && seo.keywords.trim() !== ''
            ? [seo.keywords]
            : [])
    }

    // Validate required fields using utility
    const validationError = await validateRequiredFields(body, ['name', 'description', 'price', 'category'])
    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    if (!normalizedSeo.title || !normalizedSeo.description) {
      return createErrorResponse('SEO title and description are required', 400)
    }

    // Check if category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return createErrorResponse('Invalid category', 400)
    }

    // Create product
    const product = new Product({
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      categories: categories || [],
      tags: tags || [],
      inventory: {
        quantity: inventory?.quantity || 0,
        lowStockThreshold: inventory?.lowStockThreshold || 5,
        sku: inventory?.sku || '',
        trackInventory: inventory?.trackInventory ?? true
      },
      seo: normalizedSeo,
      variants: variants || [],
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false
    })

    const savedProduct = await product.save()

    return createSuccessResponse(savedProduct, 'Product created successfully', undefined, 201)
  } catch (error: any) {
    console.error('Error creating product:', error)

    if (error.code === 11000) {
      return createErrorResponse('Product slug already exists', 400)
    }

    return handleApiError(error, 'creating product')
  }
}

