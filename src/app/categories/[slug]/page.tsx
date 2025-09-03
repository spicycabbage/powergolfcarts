import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Filter, ArrowLeft, ShoppingBag } from 'lucide-react'
import { notFound } from 'next/navigation'

// Sample categories data
const categories = [
  {
    slug: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    products: [
      {
        _id: '1',
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        shortDescription: 'Premium wireless headphones',
        price: 199.99,
        originalPrice: 249.99,
        images: [{ _id: '1', url: '/products/headphones-1.jpg', alt: 'Wireless Bluetooth Headphones', width: 800, height: 600, isPrimary: true }],
        category: { _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        categories: [{ _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
        tags: ['wireless', 'headphones', 'audio'],
        inventory: { quantity: 50, lowStockThreshold: 5, sku: 'WH-001', trackInventory: true },
        seo: { title: 'Wireless Bluetooth Headphones', description: 'High-quality wireless headphones', keywords: ['headphones', 'wireless', 'bluetooth'] },
        variants: [],
        reviews: [],
        averageRating: 4.5,
        reviewCount: 128,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'Smart Fitness Watch',
        slug: 'smart-fitness-watch',
        description: 'Advanced fitness tracking watch with heart rate monitor',
        shortDescription: 'Smart fitness watch',
        price: 299.99,
        originalPrice: 349.99,
        images: [{ _id: '2', url: '/products/fitness-watch-1.jpg', alt: 'Smart Fitness Watch', width: 800, height: 600, isPrimary: true }],
        category: { _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        categories: [{ _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
        tags: ['fitness', 'smartwatch', 'health'],
        inventory: { quantity: 30, lowStockThreshold: 5, sku: 'SFW-001', trackInventory: true },
        seo: { title: 'Smart Fitness Watch', description: 'Advanced fitness tracking watch', keywords: ['fitness', 'smartwatch', 'health'] },
        variants: [],
        reviews: [],
        averageRating: 4.3,
        reviewCount: 95,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    slug: 'clothing',
    name: 'Clothing',
    description: 'Fashion apparel for men and women',
    products: [
      {
        _id: '3',
        name: 'Organic Cotton T-Shirt',
        slug: 'organic-cotton-t-shirt',
        description: 'Comfortable organic cotton t-shirt perfect for everyday wear',
        shortDescription: 'Organic cotton t-shirt',
        price: 29.99,
        originalPrice: 39.99,
        images: [{ _id: '3', url: '/products/tshirt-1.jpg', alt: 'Organic Cotton T-Shirt', width: 800, height: 600, isPrimary: true }],
        category: { _id: 'clothing', name: 'Clothing', slug: 'clothing', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        categories: [{ _id: 'clothing', name: 'Clothing', slug: 'clothing', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
        tags: ['organic', 'cotton', 't-shirt', 'casual'],
        inventory: { quantity: 100, lowStockThreshold: 10, sku: 'OCT-001', trackInventory: true },
        seo: { title: 'Organic Cotton T-Shirt', description: 'Comfortable organic cotton t-shirt', keywords: ['organic', 'cotton', 't-shirt'] },
        variants: [],
        reviews: [],
        averageRating: 4.7,
        reviewCount: 203,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    slug: 'home-garden',
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    products: [
      {
        _id: '4',
        name: 'Modern Desk Lamp',
        slug: 'modern-desk-lamp',
        description: 'Sleek and modern desk lamp with adjustable brightness and USB charging',
        shortDescription: 'Modern desk lamp',
        price: 79.99,
        originalPrice: 99.99,
        images: [{ _id: '4', url: '/products/desk-lamp-1.jpg', alt: 'Modern Desk Lamp', width: 800, height: 600, isPrimary: true }],
        category: { _id: 'home-garden', name: 'Home & Garden', slug: 'home-garden', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        categories: [{ _id: 'home-garden', name: 'Home & Garden', slug: 'home-garden', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
        tags: ['lamp', 'desk', 'lighting', 'modern'],
        inventory: { quantity: 25, lowStockThreshold: 5, sku: 'MDL-001', trackInventory: true },
        seo: { title: 'Modern Desk Lamp', description: 'Sleek modern desk lamp', keywords: ['lamp', 'desk', 'lighting', 'modern'] },
        variants: [],
        reviews: [],
        averageRating: 4.4,
        reviewCount: 67,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
]

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find(cat => cat.slug === slug)

  if (!category) {
    return {
      title: 'Category Not Found | E-Commerce Store'
    }
  }

  return {
    title: `${category.name} | E-Commerce Store`,
    description: category.description,
  }
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = categories.find(cat => cat.slug === slug)

  if (!category) {
    notFound()
  }

  const { name, description, products } = category

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <div className="ml-2 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-700">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      {product.isNew && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          NEW
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
                                i < Math.floor(product.rating)
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

                        <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {product.inStock ? (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
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
