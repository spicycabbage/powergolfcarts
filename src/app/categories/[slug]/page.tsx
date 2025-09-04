import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Filter, ArrowLeft, ShoppingBag } from 'lucide-react'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import { getSiteConfig } from '@/lib/config'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  await connectToDatabase()
  const category = await Category.findOne({ slug }).lean()
  if (!category) {
    return { title: 'Category Not Found | E-Commerce Store' }
  }
  return {
    title: `${category.name} | E-Commerce Store`,
    description: category.description || ''
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  await connectToDatabase()
  const category = await Category.findOne({ slug }).lean()
  if (!category) {
    notFound()
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { category: category._id },
      { categories: category._id }
    ]
  })
    .sort({ createdAt: -1 })
    .lean()

  const name = (category as any).name as string
  const description = (category as any).description as string
  const cfg = getSiteConfig()
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`
  const crumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Categories', item: `${baseUrl}/categories` },
    { name: name, item: `${baseUrl}/categories/${slug}` },
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
            {/* If we had parent context, we would render it here; this single-level page remains as-is */}
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
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Most Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Rating</option>
                </select>
              </div>
              <span className="text-sm text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                    {/* Product Image */}
                    <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                          alt={typeof product.images[0] === 'string' ? product.name : (product.images[0].alt || product.name)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}

                    </Link>

                    {/* Product Info */}
                    <div className="p-5">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {(!product.inventory.trackInventory || product.inventory.quantity > 0) ? (
                          <span className="text-sm text-green-600">In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
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
          </main>
        </div>
      </div>
    </div>
  )
}
