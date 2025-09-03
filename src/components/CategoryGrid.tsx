'use client'

import Link from 'next/link'
import Image from 'next/image'

// Sample categories
const sampleCategories = [
  {
    _id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://picsum.photos/400/400?random=electronics'
  },
  {
    _id: '2',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel for all styles',
    image: 'https://picsum.photos/400/400?random=clothing'
  },
  {
    _id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: 'https://picsum.photos/400/400?random=home'
  },
  {
    _id: '4',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Gear up for your active lifestyle',
    image: 'https://picsum.photos/400/400?random=sports'
  },
  {
    _id: '5',
    name: 'Books',
    slug: 'books',
    description: 'Discover new worlds through reading',
    image: 'https://picsum.photos/400/400?random=books'
  },
  {
    _id: '6',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Look and feel your best',
    image: 'https://picsum.photos/400/400?random=beauty'
  }
]

export function CategoryGrid() {

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCategories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={category.image || '/placeholder-category.jpg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-200"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                    Shop Now →
                  </div>
                </div>
              </Link>
            ))}
          </div>

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

