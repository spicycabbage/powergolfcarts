import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Bundle from '@/models/Bundle'
import Product from '@/lib/models/Product'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    console.log(`🔄 API CALL: /bundles/${slug}/products at ${new Date().toISOString()}`)
    await connectToDatabase()

    // Get bundle configuration
    const bundle = await Bundle.findOne({ 
      slug: slug,
      isActive: true 
    })

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1

    // Build query to filter products by variant SKUs
    let query: any = {
      isActive: true,
      'variants.sku': { $regex: new RegExp(bundle.skuFilter, 'i') }
    }

    // Add search filter if provided
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
      
      // Combine with existing query
      if (query.$or) {
        query = {
          $and: [
            query,
            searchQuery
          ]
        }
      } else {
        query = {
          ...query,
          ...searchQuery
        }
      }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder

    // Execute query - get all products without pagination
    // Add _id as secondary sort to ensure consistent ordering
    const products = await Product.find(query)
      .sort({ ...sort, _id: 1 })
      .select('_id name slug images isFeatured createdAt variants')

    const totalCount = products.length

    // Process products to extract the correct variant for this bundle
    const processedProducts = products.map(product => {
      // Find the variant that matches the bundle SKU filter
      const matchingVariant = product.variants?.find(variant => 
        variant.sku && variant.sku.match(new RegExp(bundle.skuFilter, 'i'))
      )

      if (matchingVariant) {
        const variantId = `${product._id}-${matchingVariant.sku}`
        console.log(`🔧 API: Generated variantId for ${product.name}: ${variantId}`)
        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: matchingVariant.originalPrice || matchingVariant.price || 0,
          originalPrice: matchingVariant.originalPrice || matchingVariant.price || 0,
          images: product.images || [],
          inventory: matchingVariant.inventory || 0,
          sku: matchingVariant.sku,
          variantId: variantId // Use consistent product+sku combination
        }
      }
      
      return null
    }).filter(Boolean)

    return NextResponse.json({
      products: processedProducts,
      totalCount: processedProducts.length,
      bundle: {
        name: bundle.name,
        description: bundle.description,
        requiredQuantity: bundle.requiredQuantity,
        discountPercentage: bundle.discountPercentage
      }
    })
  } catch (error) {
    console.error('Error fetching bundle products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundle products' },
      { status: 500 }
    )
  }
}
