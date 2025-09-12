import { Metadata } from 'next'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { ArrowRight } from 'lucide-react'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

export const metadata: Metadata = {
  title: 'Categories | Godbud.cc',
  description: 'Browse our product categories and find exactly what you need.',
  alternates: {
    canonical: '/categories',
  },
}

async function fetchCategories() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find({ isActive: true })
      .select('name slug description image parent isActive featuredOnHomepage homepageOrder')
      .sort({ name: 1 })
      .limit(50) // Limit for mobile performance
      .lean()
      .maxTimeMS(5000) // 5 second timeout

    return categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  try {
    const categories = await fetchCategories()

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-0.5 text-gray-700">Browse our product categories and find exactly what you need.</p>
        </header>

        {/* Categories Grid */}
        <main className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ArrowRight className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
                <p className="text-gray-700 mb-6">We're working on adding product categories.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category: any) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <OptimizedImage
                    src={category.image || '/uploads/logo-1756875309898.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-200"></div>
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg group-hover:bg-primary-700 transition-colors">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                </Link>
              ))}
              </div>
            )}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Categories page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're having trouble loading the categories page.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
        
      </div>
    )
  }
}


