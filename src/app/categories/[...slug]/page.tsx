import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, ArrowLeft, ShoppingBag } from 'lucide-react'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import { getSiteConfig } from '@/lib/config'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'

export const dynamic = 'force-dynamic'
import SortSelect from '@/components/SortSelect'

interface CatchAllCategoryPageProps {
  params: { slug: string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: CatchAllCategoryPageProps): Promise<Metadata> {
  const segments = Array.isArray(params.slug) ? params.slug : [params.slug]
  const lastSlug = segments[segments.length - 1]
  await connectToDatabase()
  const category = await Category.findOne({ slug: lastSlug }).lean()
  if (!category) {
    return { title: 'Category Not Found | E-Commerce Store' }
  }
  return {
    title: `${category.name} | E-Commerce Store`,
    description: category.description || ''
  }
}

export default async function CatchAllCategoryPage({ params, searchParams }: CatchAllCategoryPageProps) {
  const segments = Array.isArray(params.slug) ? params.slug : [params.slug]
  const lastSlug = segments[segments.length - 1]

  await connectToDatabase()
  const category = await Category.findOne({ slug: lastSlug }).lean()
  if (!category) {
    notFound()
  }

  // Collect this category and all descendant category IDs (recursive)
  const ids: any[] = [(category as any)._id]
  let frontier: any[] = [(category as any)._id]
  // BFS to gather all children at any depth
  // eslint-disable-next-line no-constant-condition
  while (frontier.length > 0) {
    const children = await Category.find({ parent: { $in: frontier } }).select('_id').lean()
    const newIds = children
      .map((c: any) => c._id)
      .filter((id: any) => !ids.some((x) => String(x) === String(id)))
    if (newIds.length === 0) break
    ids.push(...newIds)
    frontier = newIds
  }
  const idsAsStrings = ids.map((x: any) => String(x))

  const sortParam = (typeof searchParams?.sort === 'string'
    ? searchParams?.sort
    : Array.isArray(searchParams?.sort)
    ? searchParams?.sort[0]
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
  const productsTyped = await Product.find(typedQuery).sort(sortBy as any).lean()

  // Legacy fallback: match documents that incorrectly stored slugs in category fields
  const descendantCats = await Category.find({ _id: { $in: ids } }).select('slug name').lean()
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
  const productsLegacy = await Product.collection.find(legacyQuery).sort(sortBy as any).toArray()

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
      <BreadcrumbsJsonLd crumbs={crumbs} />
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-primary-600">Categories</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{name}</span>
          </nav>
        </div>
      </section>

      {/* Category Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              <p className="text-gray-600 mb-4">{description}</p>
              <p className="text-sm text-gray-500">
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Main Content */}
          <main>
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
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
                {products.map((product) => (
                  <div key={(product as any)._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                    {/* Product Image */}
                    <Link href={`/products/${(product as any).slug}`} className="block relative aspect-square overflow-hidden cursor-pointer">
                      {(product as any).images && (product as any).images.length > 0 ? (
                        <Image
                          src={typeof (product as any).images[0] === 'string' ? (product as any).images[0] : (product as any).images[0].url}
                          alt={typeof (product as any).images[0] === 'string' ? (product as any).name : ((product as any).images[0].alt || (product as any).name)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      {(product as any).originalPrice && (product as any).originalPrice > (product as any).price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((((product as any).originalPrice - (product as any).price) / (product as any).originalPrice) * 100))}% OFF
                        </div>
                      )}

                    </Link>

                    {/* Product Info */}
                    <div className="p-5">
                      <Link href={`/products/${(product as any).slug}`} className="cursor-pointer">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                          {(product as any).name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor((product as any).averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({(product as any).reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            ${Number((product as any).price ?? (product as any).originalPrice ?? 0).toFixed(2)}
                          </span>
                          {(product as any).originalPrice && (product as any).originalPrice > (product as any).price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${Number((product as any).originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {(!(product as any).inventory.trackInventory || (product as any).inventory.quantity > 0) ? (
                          <span className="text-sm text-green-600">In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>) )}
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
          </main>
        </div>
      </div>
    </div>
  )
}


