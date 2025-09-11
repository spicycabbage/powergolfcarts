import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, ArrowLeft, ShoppingBag } from 'lucide-react'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import VariantCard from '@/components/product/VariantCard'
import { serializeProductForClient } from '@/lib/serializers'
import { getSiteConfig } from '@/lib/config'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import { isUsingDataApi, findOne as dataFindOne, findMany as dataFindMany } from '@/lib/dataApi'
import { Breadcrumbs } from '@/components/Breadcrumbs' // Import Breadcrumbs

export const dynamic = 'force-dynamic'
import SortSelect from '@/components/SortSelect'

interface CatchAllCategoryPageProps {
  params: Promise<{ slug: string[] }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CatchAllCategoryPageProps): Promise<Metadata> {
  const resolved = await params
  const segments = Array.isArray(resolved.slug) ? resolved.slug : [resolved.slug]
  const lastSlug = segments[segments.length - 1]
  let category: any
  if (isUsingDataApi()) {
    category = await dataFindOne('categories', { slug: lastSlug })
  } else {
    await connectToDatabase()
    category = await Category.findOne({ slug: lastSlug }).lean()
  }
  if (!category) {
    return { title: 'Category Not Found | Godbud.cc' }
  }
  return {
    title: category.seo?.title || `${category.name} | Godbud.cc`,
    description: category.seo?.description || category.description || '',
    keywords: category.seo?.keywords || [],
    alternates: {
      canonical: category.seo?.canonical || `/categories/${lastSlug}`,
    },
  }
}

export default async function CatchAllCategoryPage({ params, searchParams }: CatchAllCategoryPageProps) {
  const resolved = await params
  const segments = Array.isArray(resolved.slug) ? resolved.slug : [resolved.slug]
  const lastSlug = segments[segments.length - 1]

  let category: any
  if (isUsingDataApi()) {
    category = await dataFindOne('categories', { slug: lastSlug })
  } else {
    await connectToDatabase()
    category = await Category.findOne({ slug: lastSlug }).lean()
  }
  if (!category) {
    return notFound()
  }

  // Manually fetch breadcrumbs to ensure the path is populated
  const breadcrumbsData = await Category.getBreadcrumbs(category._id);
  const breadcrumbItems = breadcrumbsData.map((segment: { name: string; slug: string; }) => ({
    name: segment.name,
    href: `/categories/${segment.slug}`,
  }));

  // Collect this category and all descendant category IDs (recursive)
  const ids: any[] = [(category as any)._id]
  let frontier: any[] = [(category as any)._id]
  // BFS to gather all children at any depth
  // eslint-disable-next-line no-constant-condition
  while (frontier.length > 0) {
    let children: any[] = []
    if (isUsingDataApi()) {
      children = await dataFindMany('categories', { filter: { parent: { $in: frontier } }, projection: { _id: 1 } })
    } else {
      children = await Category.find({ parent: { $in: frontier } }).select('_id').lean()
    }
    const newIds = children
      .map((c: any) => c._id)
      .filter((id: any) => !ids.some((x) => String(x) === String(id)))
    if (newIds.length === 0) break
    ids.push(...newIds)
    frontier = newIds
  }
  const idsAsStrings = ids.map((x: any) => String(x))

  const sp = searchParams ? await searchParams : undefined
  const sortParam = (typeof sp?.sort === 'string'
    ? sp?.sort
    : Array.isArray(sp?.sort)
    ? sp?.sort[0]
    : undefined) || 'popular'

  const sortBy = (() => {
    switch (sortParam) {
      case 'priceAsc':
        return { price: 1 }
      case 'priceDesc':
        return { price: -1 }
      case 'newest':
        return { createdAt: -1 }
      case 'rating':
        return { averageRating: -1 }
      default:
        return { createdAt: -1 }
    }
  })()

  const typedQuery: any = {
    isActive: true,
    $or: [
      { category: { $in: ids } },
      { categories: { $in: ids } },
      { category: { $in: idsAsStrings } },
      { categories: { $in: idsAsStrings } },
    ]
  }
  // Fetch only fields needed for the grid to reduce payload
  let productsTyped: any[] = []
  if (isUsingDataApi()) {
    productsTyped = await dataFindMany('products', {
      filter: typedQuery,
      projection: {
        name: 1, slug: 1, price: 1, originalPrice: 1, images: 1,
        averageRating: 1, reviewCount: 1, inventory: 1, variants: 1
      },
      sort: sortBy as any,
    })
  } else {
    productsTyped = await Product.find(typedQuery)
      .select('name slug price originalPrice images averageRating reviewCount inventory variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku')
      .sort(sortBy as any)
      .lean()
  }

  // Legacy fallback: match documents that incorrectly stored slugs in category fields
  // Only run legacy fallback when no typed matches were found
  let productsLegacy: any[] = []
  if (!productsTyped.length) {
    let descendantCats: any[] = []
    if (isUsingDataApi()) {
      descendantCats = await dataFindMany('categories', { filter: { _id: { $in: ids } }, projection: { slug: 1, name: 1 } })
    } else {
      descendantCats = await Category.find({ _id: { $in: ids } }).select('slug name').lean()
    }
    const slugList = descendantCats.map((c: any) => c.slug)
    const nameList = descendantCats.map((c: any) => c.name)
    const nameRegexes = nameList.map((n: any) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
    const legacyQuery = {
      isActive: true,
      $or: [
        { category: { $in: slugList } },
        { categories: { $in: slugList } },
        { category: { $in: nameList } },
        { categories: { $in: nameList } },
        { category: { $in: nameRegexes } },
        { categories: { $in: nameRegexes } },
      ]
    }
    const projection = { name: 1, slug: 1, price: 1, originalPrice: 1, images: 1, averageRating: 1, reviewCount: 1, inventory: 1, variants: 1 }
    if (isUsingDataApi()) {
      productsLegacy = await dataFindMany('products', { filter: legacyQuery, projection, sort: sortBy as any })
    } else {
      productsLegacy = await Product.collection.find(legacyQuery, { projection }).sort(sortBy as any).toArray()
    }
  }

  // Merge and dedupe by _id
  const seen = new Set<string>()
  const products = [...productsTyped, ...productsLegacy].filter((p: any) => {
    const id = String(p._id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  const name = (category as any).name as string
  const description = (category as any).description as string
  const cfg = getSiteConfig()
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`
  const crumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Categories', item: `${baseUrl}/categories` },
    { name: name, item: `${baseUrl}/categories/${lastSlug}` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbsJsonLd categoryId={String(category._id)} />
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {description && (
            <div className="mt-4 prose max-w-none text-gray-600">
              <p>{description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Sort Options */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <SortSelect value={sortParam} />
            </div>
            <span className="text-sm text-gray-600">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <VariantCard 
                  key={String((product as any)._id)} 
                  product={serializeProductForClient(product) as any}
                  priority={index < 4} // Add priority loading for the first 4 images
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingBag className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                There are no products in this category yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


