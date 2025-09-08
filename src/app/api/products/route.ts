import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
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
    let sortBy = searchParams.get('sortBy') || 'createdAt'
    if (sortBy === 'isFeatured') {
      sortBy = 'isFeatured'
    }
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const featured = searchParams.get('featured') === 'true'
    const inStock = searchParams.get('inStock') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const fieldsParam = (searchParams.get('fields') || '').trim()
    const populateParam = (searchParams.get('populate') || 'true').toLowerCase()
    const doPopulate = populateParam !== 'false'

    // Build query
    const query: any = {}

    // Visibility filter: only allow includeInactive for admins
    if (includeInactive) {
      const session: any = await getServerSession(authOptions as any)
      if (!session || !session.user || session.user.role !== 'admin') {
        // Fallback to active-only for non-admins
        query.isActive = true
      }
      // Admins can see all (no isActive filter)
    } else {
      // Default: only active
      query.isActive = true
    }

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

    // Search filter (regex-based to avoid text-index dependency)
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      const searchOr = [{ name: regex }, { description: regex }]
      if (query.$or) {
        // Combine existing $or (e.g., category) with search using $and
        query.$and = [{ $or: query.$or }, { $or: searchOr }]
        delete query.$or
      } else {
        query.$or = searchOr
      }
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

    let findQuery = Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    if (fieldsParam) {
      // Support comma-separated fields; allow nested dot paths
      const normalized = fieldsParam.split(',').map(f => f.trim()).filter(Boolean).join(' ')
      findQuery = findQuery.select(normalized)
    }

    if (doPopulate) {
      findQuery = findQuery
        .populate('category', 'name slug')
        .populate('categories', 'name slug')
    }

    const [products, total] = await Promise.all([
      findQuery,
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
      slug,
      description,
      shortDescription,
      productType,
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

    // Validate required fields (description optional)
    const validationError = await validateRequiredFields(body, ['name', 'category'])
    if (validationError) {
      return createErrorResponse(validationError, 400)
    }
    const isVariable = (productType || 'simple') === 'variable'
    if (!isVariable && price == null && originalPrice == null) {
      return createErrorResponse('Regular Price is required', 400)
    }

    // SEO optional; fill sensible defaults

    // Check if category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return createErrorResponse('Invalid category', 400)
    }

    // Normalize pricing: treat originalPrice as Regular Price and price as Sales Price (if any)
    let regularPrice = originalPrice as number | undefined
    let salesPrice = price as number | undefined
    if (regularPrice != null && salesPrice != null) {
      if (salesPrice < 0 || regularPrice < 0) {
        return createErrorResponse('Prices must be positive', 400)
      }
      if (salesPrice >= regularPrice) {
        return createErrorResponse('Sales Price must be less than Regular Price', 400)
      }
    }

    // Normalize and validate variant pricing
    let normalizedVariants: any[] = []
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const vRegular = v.originalPrice as number | undefined
        let vSale = v.price as number | undefined
        if (vRegular == null || Number.isNaN(vRegular) || vRegular <= 0) {
          return createErrorResponse('Variant Regular Price is required and must be > 0', 400)
        }
        // Only validate when sale provided
        if (vSale != null) {
          if (Number.isNaN(vSale) || vSale < 0) {
            return createErrorResponse('Variant prices must be positive', 400)
          }
          if (vSale >= vRegular) {
            return createErrorResponse('Variant Sales Price must be less than Regular Price', 400)
          }
        }
        normalizedVariants.push({ ...v, originalPrice: vRegular, price: vSale })
      }
    }

    if (isVariable && normalizedVariants.length === 0) {
      return createErrorResponse('At least one variant is required for variable products', 400)
    }

    // Derive top-level price/originalPrice for variable products
    if (isVariable && normalizedVariants.length > 0) {
      const effectivePrices = normalizedVariants.map(v => (v.price != null ? v.price : v.originalPrice))
      const regulars = normalizedVariants.map(v => v.originalPrice)
      const minEffective = Math.min(...effectivePrices)
      const minRegular = Math.min(...regulars)
      salesPrice = minEffective
      regularPrice = minRegular
    } else if (!isVariable && regularPrice != null && salesPrice == null) {
      // For simple products without sale price, display regular as effective price
      salesPrice = regularPrice
    }

    // Create product
    const product = new Product({
      name,
      slug,
      description: typeof description === 'string' ? description : String(description || ''),
      shortDescription: typeof shortDescription === 'string' ? shortDescription : String(shortDescription || ''),
      productType: productType || 'simple',
      price: salesPrice,
      originalPrice: regularPrice,
      images,
      category,
      categories: categories || [],
      tags: tags || [],
      inventory: {
        quantity: inventory?.quantity || 0,
        lowStockThreshold: inventory?.lowStockThreshold || 5,
        trackInventory: inventory?.trackInventory ?? true,
        ...(inventory?.sku ? { sku: inventory.sku } : {}),
      },
      seo: normalizedSeo,
      variants: normalizedVariants,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false
    })

    // Auto-unique slug if collision
    let savedProduct
    try {
      savedProduct = await product.save()
    } catch (e: any) {
      if (e?.code === 11000 && e?.keyPattern?.slug) {
        // try slug-2, slug-3, ...
        const base = (product.slug || name).toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        let counter = 2
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const candidate = `${base}-${counter}`
          const exists = await Product.exists({ slug: candidate })
          if (!exists) {
            product.slug = candidate
            savedProduct = await product.save()
            break
          }
          counter += 1
        }
      } else {
        throw e
      }
    }

    return createSuccessResponse(savedProduct, 'Product created successfully', undefined, 201)
  } catch (error: any) {
    console.error('Error creating product:', error)

    if (error.code === 11000) {
      return createErrorResponse('Product slug already exists', 400)
    }

    return handleApiError(error, 'creating product')
  }
}

