'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

// Sample featured products
const featuredProducts = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      { url: 'https://picsum.photos/400/400?random=1', alt: 'Wireless Bluetooth Headphones' }
    ],
    averageRating: 4.5,
    reviewCount: 128,
  },
  {
    _id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    price: 299.99,
    originalPrice: 349.99,
    images: [
      { url: 'https://picsum.photos/400/400?random=2', alt: 'Smart Fitness Watch' }
    ],
    averageRating: 4.3,
    reviewCount: 95,
  },
  {
    _id: '3',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-t-shirt',
    price: 29.99,
    originalPrice: 39.99,
    images: [
      { url: 'https://picsum.photos/400/400?random=3', alt: 'Organic Cotton T-Shirt' }
    ],
    averageRating: 4.7,
    reviewCount: 203,
  },
  {
    _id: '4',
    name: 'Modern Desk Lamp',
    slug: 'modern-desk-lamp',
    price: 79.99,
    originalPrice: 99.99,
    images: [
      { url: 'https://picsum.photos/400/400?random=4', alt: 'Modern Desk Lamp' }
    ],
    averageRating: 4.4,
    reviewCount: 67,
  }
]

export function FeaturedProducts() {
  const { addItem } = useCart()

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
    })
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of top-rated products loved by our customers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                {/* Product Image */}
                <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
                  <Image
                    src={product.images[0]?.url || '/placeholder-product.jpg'}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
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
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

