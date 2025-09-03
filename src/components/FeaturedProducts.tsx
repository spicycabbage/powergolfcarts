'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Product, Category } from '@/types'

// Sample featured products
const featuredProducts: Product[] = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      { 
        _id: '1',
        url: 'https://picsum.photos/400/400?random=1', 
        alt: 'Wireless Bluetooth Headphones',
        width: 400,
        height: 400,
        isPrimary: true
      }
    ],
    category: { _id: 'cat1', name: 'Electronics', slug: 'electronics' } as Category,
    categories: [],
    tags: ['wireless', 'bluetooth', 'headphones'],
    inventory: { quantity: 50, lowStockThreshold: 10, sku: 'WBH-001', trackInventory: true },
    seo: { title: 'Wireless Bluetooth Headphones', description: 'Buy wireless bluetooth headphones', keywords: [] },
    variants: [],
    reviews: [],
    averageRating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness tracking with heart rate monitor',
    price: 299.99,
    originalPrice: 349.99,
    images: [
      { 
        _id: '2',
        url: 'https://picsum.photos/400/400?random=2', 
        alt: 'Smart Fitness Watch',
        width: 400,
        height: 400,
        isPrimary: true
      }
    ],
    category: { _id: 'cat1', name: 'Electronics', slug: 'electronics' } as Category,
    categories: [],
    tags: ['fitness', 'smartwatch', 'health'],
    inventory: { quantity: 30, lowStockThreshold: 5, sku: 'SFW-001', trackInventory: true },
    seo: { title: 'Smart Fitness Watch', description: 'Buy smart fitness watch', keywords: [] },
    variants: [],
    reviews: [],
    averageRating: 4.3,
    reviewCount: 95,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-t-shirt',
    description: '100% organic cotton, sustainable and comfortable',
    price: 29.99,
    originalPrice: 39.99,
    images: [
      { 
        _id: '3',
        url: 'https://picsum.photos/400/400?random=3', 
        alt: 'Organic Cotton T-Shirt',
        width: 400,
        height: 400,
        isPrimary: true
      }
    ],
    category: { _id: 'cat2', name: 'Clothing', slug: 'clothing' } as Category,
    categories: [],
    tags: ['organic', 'cotton', 'sustainable'],
    inventory: { quantity: 100, lowStockThreshold: 20, sku: 'OCT-001', trackInventory: true },
    seo: { title: 'Organic Cotton T-Shirt', description: 'Buy organic cotton t-shirt', keywords: [] },
    variants: [],
    reviews: [],
    averageRating: 4.7,
    reviewCount: 203,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    name: 'Modern Desk Lamp',
    slug: 'modern-desk-lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature',
    price: 79.99,
    originalPrice: 99.99,
    images: [
      { 
        _id: '4',
        url: 'https://picsum.photos/400/400?random=4', 
        alt: 'Modern Desk Lamp',
        width: 400,
        height: 400,
        isPrimary: true
      }
    ],
    category: { _id: 'cat3', name: 'Home & Garden', slug: 'home-garden' } as Category,
    categories: [],
    tags: ['lamp', 'led', 'modern'],
    inventory: { quantity: 25, lowStockThreshold: 5, sku: 'MDL-001', trackInventory: true },
    seo: { title: 'Modern Desk Lamp', description: 'Buy modern desk lamp', keywords: [] },
    variants: [],
    reviews: [],
    averageRating: 4.4,
    reviewCount: 67,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export function FeaturedProducts() {
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem(product)
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

