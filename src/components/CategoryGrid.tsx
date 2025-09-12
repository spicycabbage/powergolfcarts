'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  featuredOnHomepage?: boolean
  homepageOrder?: number
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add a small delay to prioritize above-the-fold content
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const response = await fetch('/api/categories?limit=8&featured=true')
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories)
          } else {
            console.error('Invalid response format:', data)
            setCategories([])
          }
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText)
          setCategories([])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories to find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories to find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <OptimizedImage
                    src={category.image || '/placeholder-category.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-200"></div>
                </div>

                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="inline-block bg-primary-600 text-white py-2 px-4 rounded-lg font-medium group-hover:bg-primary-700 transition-colors">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Show message if no categories */}
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories available. Add categories in the admin panel to display them here.</p>
            </div>
          )}

        {/* Browse All Categories */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  )
}

