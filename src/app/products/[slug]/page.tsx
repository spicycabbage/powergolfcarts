import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProductImageGallery } from '@/components/ProductImageGallery'
import { ProductActions } from '@/components/ProductActions'
import JsonLd from '@/components/seo/JsonLd'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import { getSiteConfig } from '@/lib/config'

// Sample products data
const products = [
  {
    _id: '1',
    slug: 'wireless-bluetooth-headphones',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Experience studio-quality sound with deep bass and crystal-clear highs. The comfortable over-ear design provides all-day comfort for extended listening sessions.',
    shortDescription: 'Premium wireless headphones with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      { _id: '1', url: 'https://picsum.photos/800/600?random=1', alt: 'Wireless Bluetooth Headphones', width: 800, height: 600, isPrimary: true },
      { _id: '2', url: 'https://picsum.photos/800/600?random=2', alt: 'Wireless Bluetooth Headphones', width: 800, height: 600, isPrimary: false },
      { _id: '3', url: 'https://picsum.photos/800/600?random=3', alt: 'Wireless Bluetooth Headphones', width: 800, height: 600, isPrimary: false }
    ],
    category: { _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    categories: [{ _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    tags: ['wireless', 'headphones', 'audio', 'bluetooth'],
    inventory: { quantity: 50, lowStockThreshold: 5, sku: 'WH-001', trackInventory: true },
    seo: { title: 'Wireless Bluetooth Headphones', description: 'Premium wireless headphones with noise cancellation', keywords: ['headphones', 'wireless', 'bluetooth', 'audio'] },
    variants: [],
    reviews: [],
    averageRating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Wireless Bluetooth 5.0',
      'Comfortable over-ear design',
      'Built-in microphone'
    ]
  },
  {
    _id: '2',
    slug: 'smart-fitness-watch',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness watch with heart rate monitoring, GPS, and 7-day battery life. Track your workouts, monitor your health, and stay connected with this comprehensive fitness companion.',
    shortDescription: 'Advanced fitness watch with GPS tracking',
    price: 299.99,
    originalPrice: 349.99,
    images: [
      { _id: '2', url: 'https://picsum.photos/800/600?random=4', alt: 'Smart Fitness Watch', width: 800, height: 600, isPrimary: true },
      { _id: '3', url: 'https://picsum.photos/800/600?random=5', alt: 'Smart Fitness Watch', width: 800, height: 600, isPrimary: false }
    ],
    category: { _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    categories: [{ _id: 'electronics', name: 'Electronics', slug: 'electronics', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    tags: ['fitness', 'smartwatch', 'health', 'gps'],
    inventory: { quantity: 30, lowStockThreshold: 5, sku: 'FW-001', trackInventory: true },
    seo: { title: 'Smart Fitness Watch', description: 'Advanced fitness watch with GPS tracking', keywords: ['fitness', 'smartwatch', 'health', 'gps'] },
    variants: [],
    reviews: [],
    averageRating: 4.3,
    reviewCount: 95,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [
      'Heart rate monitoring',
      'GPS tracking',
      '7-day battery life',
      'Water resistant',
      'Sleep tracking'
    ]
  },
  {
    _id: '3',
    slug: 'organic-cotton-t-shirt',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt available in multiple colors. Made from 100% organic cotton for a soft, breathable feel that gets even better with every wash.',
    shortDescription: 'Comfortable organic cotton t-shirt',
    price: 29.99,
    originalPrice: 39.99,
    images: [
      { _id: '3', url: 'https://picsum.photos/800/600?random=6', alt: 'Organic Cotton T-Shirt', width: 800, height: 600, isPrimary: true },
      { _id: '4', url: 'https://picsum.photos/800/600?random=7', alt: 'Organic Cotton T-Shirt', width: 800, height: 600, isPrimary: false }
    ],
    category: { _id: 'clothing', name: 'Clothing', slug: 'clothing', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    categories: [{ _id: 'clothing', name: 'Clothing', slug: 'clothing', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    tags: ['organic', 'cotton', 't-shirt', 'casual'],
    inventory: { quantity: 100, lowStockThreshold: 10, sku: 'TS-001', trackInventory: true },
    seo: { title: 'Organic Cotton T-Shirt', description: 'Comfortable organic cotton t-shirt', keywords: ['organic', 'cotton', 't-shirt'] },
    variants: [],
    reviews: [],
    averageRating: 4.7,
    reviewCount: 203,
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [
      '100% organic cotton',
      'Pre-shrunk fabric',
      'Multiple colors available',
      'Machine washable',
      'Comfortable fit'
    ]
  },
  {
    _id: '4',
    slug: 'modern-desk-lamp',
    name: 'Modern Desk Lamp',
    description: 'Sleek modern desk lamp with adjustable brightness and USB charging port. Perfect for home office, study, or reading. Features energy-efficient LED lighting with multiple brightness levels.',
    shortDescription: 'Modern desk lamp with USB charging',
    price: 79.99,
    originalPrice: 99.99,
    images: [
      { _id: '4', url: 'https://picsum.photos/800/600?random=8', alt: 'Modern Desk Lamp', width: 800, height: 600, isPrimary: true },
      { _id: '5', url: 'https://picsum.photos/800/600?random=9', alt: 'Modern Desk Lamp', width: 800, height: 600, isPrimary: false }
    ],
    category: { _id: 'home-garden', name: 'Home & Garden', slug: 'home-garden', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    categories: [{ _id: 'home-garden', name: 'Home & Garden', slug: 'home-garden', children: [], seo: { title: '', description: '', keywords: [] }, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    tags: ['lamp', 'desk', 'lighting', 'modern'],
    inventory: { quantity: 25, lowStockThreshold: 5, sku: 'DL-001', trackInventory: true },
    seo: { title: 'Modern Desk Lamp', description: 'Modern desk lamp with USB charging', keywords: ['lamp', 'desk', 'lighting', 'modern'] },
    variants: [],
    reviews: [],
    averageRating: 4.4,
    reviewCount: 67,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [
      'Adjustable brightness',
      'USB charging port',
      'Energy-efficient LED',
      'Modern design',
      'Easy to assemble'
    ]
  }
]

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = products.find(p => p.slug === slug)

  if (!product) {
    return {
      title: 'Product Not Found | E-Commerce Store'
    }
  }

  return {
    title: `${product.name} | E-Commerce Store`,
    description: product.shortDescription,
  }
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = products.find(p => p.slug === slug)

  if (!product) {
    notFound()
  }

  const categoryPath = `/categories/${product.category.slug}`
  const cfg = getSiteConfig()
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`
  const crumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Categories', item: `${baseUrl}/categories` },
    { name: product.category.name, item: `${baseUrl}${categoryPath}` },
    { name: product.name, item: `${baseUrl}/products/${product.slug}` },
  ]

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbsJsonLd crumbs={crumbs} />
      {/* JSON-LD: Product */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.shortDescription || product.description?.slice(0, 160),
          sku: product.inventory?.sku,
          category: product.category?.name,
          image: product.images?.map((img) => img.url).slice(0, 5),
          brand: {
            '@type': 'Brand',
            name: 'E-Commerce Store'
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price,
            availability: product.inventory?.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/products/${product.slug}`
          },
          aggregateRating: product.reviewCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount
          } : undefined
        }}
      />
      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-primary-600">Categories</Link>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.averageRating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.inventory.quantity > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">In Stock ({product.inventory.quantity})</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Product Actions */}
            <ProductActions product={product} />

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">SKU:</span>
                  <span className="ml-2 text-gray-900">{product.inventory.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Category:</span>
                  <span className="ml-2 text-gray-900">{product.category.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Stock:</span>
                  <span className="ml-2 text-gray-900">
                    {product.inventory.quantity > 0 ? `${product.inventory.quantity} available` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p._id !== product._id && p.category._id === product.category._id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group cursor-default"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Link href={`/products/${relatedProduct.slug}`} className="block">
                      <Image
                        src={relatedProduct.images[0].url}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </Link>
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-gray-900">
                      ${relatedProduct.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
