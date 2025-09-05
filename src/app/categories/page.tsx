import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Categories | E-Commerce Store',
  description: 'Browse our product categories and find exactly what you need.',
}

async function fetchCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await fetchCategories()
  const featuredCategories = categories.slice(0, 3)
  const otherCategories = categories.slice(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Discover our wide range of product categories. Find exactly what you're looking for.
          </p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCategories.map((category: any) => (
              <div
                key={category.slug}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-default"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Link href={`/categories/${category.slug}`} className="block cursor-pointer">
                    <Image
                      src={category.image || '/uploads/logo-1756875309898.jpg'}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-200"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      {category.productCount ?? 0} products
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <Link href={`/categories/${category.slug}`} className="cursor-pointer">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors cursor-pointer">
                      {category.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description || ''}
                  </p>
                  <Link href={`/categories/${category.slug}`} className="cursor-pointer">
                    <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors cursor-pointer">
                      Shop Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Categories</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCategories.concat(featuredCategories).map((category: any) => (
              <div
                key={category.slug}
                className="group bg-gray-50 rounded-lg p-6 hover:bg-white hover:shadow-md transition-all duration-200 cursor-default"
              >
                <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                  <Link href={`/categories/${category.slug}`} className="block cursor-pointer">
                    <Image
                      src={category.image || '/uploads/logo-1756875309898.jpg'}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                </div>

                <Link href={`/categories/${category.slug}`} className="cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors cursor-pointer">
                    {category.name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {category.description || ''}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.productCount ?? 0} products
                  </span>
                  <Link href={`/categories/${category.slug}`} className="cursor-pointer">
                    <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform cursor-pointer" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Browse all our products or contact us for help finding the perfect item.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse All Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
