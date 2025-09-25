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
import { isUsingDataApi, findMany as dataFindMany, count as dataCount, insertOne as dataInsertOne, findOne as dataFindOne } from '@/lib/dataApi'
import { addProductVirtuals } from '@/lib/utils/product'

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const usingDataApi = isUsingDataApi()
    if (!usingDataApi) {
      // Ensure database connection (Mongoose path)
      await connectToDatabase()
    }

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

    // Search filter - we'll handle prioritization in the aggregation pipeline
    let hasSearch = false
    if (search && search.trim()) {
      hasSearch = true
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

    let products: any[] = []
    let total = 0
    if (usingDataApi) {
      const projection: any = {}
      if (fieldsParam) {
        for (const f of fieldsParam.split(',').map(s => s.trim()).filter(Boolean)) projection[f] = 1
      }
      products = await dataFindMany('products', {
        filter: query,
        sort: sortOptions,
        projection: Object.keys(projection).length ? projection : undefined,
        limit,
        skip,
      })
      total = await dataCount('products', query)
    } else {
      // Use aggregation pipeline for search to prioritize name matches
      if (hasSearch && search) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const exactRegex = new RegExp(`^${escaped}$`, 'i') // Exact match
        const startsWithRegex = new RegExp(`^${escaped}`, 'i') // Starts with
        const containsRegex = new RegExp(escaped, 'i') // Contains
        
        const pipeline: any[] = [
          { $match: query },
          {
            $addFields: {
              searchPriority: {
                $switch: {
                  branches: [
                    // Priority 1: Exact name match
                    { case: { $regexMatch: { input: "$name", regex: exactRegex } }, then: 1 },
                    // Priority 2: Name starts with search term
                    { case: { $regexMatch: { input: "$name", regex: startsWithRegex } }, then: 2 },
                    // Priority 3: Name contains search term
                    { case: { $regexMatch: { input: "$name", regex: containsRegex } }, then: 3 },
                    // Priority 4: Description contains search term
                    { case: { $regexMatch: { input: "$description", regex: containsRegex } }, then: 4 }
                  ],
                  default: 5
                }
              }
            }
          },
          { $sort: { searchPriority: 1, ...sortOptions } },
          { $skip: skip },
          { $limit: limit }
        ]

        if (doPopulate) {
          pipeline.push(
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
                pipeline: [{ $project: { name: 1, slug: 1 } }]
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: '_id',
                as: 'categories',
                pipeline: [{ $project: { name: 1, slug: 1 } }]
              }
            },
            {
              $addFields: {
                category: { $arrayElemAt: ['$category', 0] }
              }
            }
          )
        }

        // Remove searchPriority field from final results
        pipeline.push({ $unset: 'searchPriority' })

        if (fieldsParam) {
          const projection: any = {}
          for (const f of fieldsParam.split(',').map(s => s.trim()).filter(Boolean)) {
            projection[f] = 1
          }
          pipeline.push({ $project: projection })
        }

        const [docs, cnt] = await Promise.all([
          Product.aggregate(pipeline),
          Product.countDocuments(query)
        ])
        products = docs
        total = cnt
      } else {
        // Regular query without search prioritization
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

        const [docs, cnt] = await Promise.all([
          findQuery,
          Product.countDocuments(query)
        ])
        products = docs as any
        total = cnt
      }
    }

    // Add virtual fields using utility functions
    const productsWithVirtuals = products.map(addProductVirtuals)

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
    const usingDataApi = isUsingDataApi()
    if (!usingDataApi) {
      await connectToDatabase()
    }

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

    // Check if category exists (best-effort)
    if (category) {
      try {
        if (usingDataApi) {
          const cat = await dataFindOne('categories', { _id: category }, { _id: 1 })
          if (!cat) return createErrorResponse('Invalid category', 400)
        } else {
          const categoryExists = await Category.findById(category)
          if (!categoryExists) return createErrorResponse('Invalid category', 400)
        }
      } catch {
        // fall through and let insert fail if truly invalid
      }
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

    const toInsert = {
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
      isFeatured: isFeatured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (usingDataApi) {
      // Auto-unique slug loop using Data API
      let base = (slug || name).toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      let candidate = base
      let counter = 1
      while (await dataFindOne('products', { slug: candidate }, { _id: 1 })) {
        counter += 1
        candidate = `${base}-${counter}`
      }
      toInsert.slug = candidate
      const insertedId = await dataInsertOne('products', toInsert)
      return createSuccessResponse({ _id: insertedId, ...toInsert }, 'Product created successfully', undefined, 201)
    }

    // Mongoose path
    const product = new Product(toInsert as any)
    const saved = await product.save()
    return createSuccessResponse(saved, 'Product created successfully', undefined, 201)
  } catch (error: any) {
    console.error('Error creating product:', error)

    if (error.code === 11000) {
      return createErrorResponse('Product slug already exists', 400)
    }

    return handleApiError(error, 'creating product')
  }
}

