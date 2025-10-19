import { Metadata } from 'next'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export const metadata: Metadata = {
  title: 'Bundle Deals | Power Golf Carts',
  description: 'Save 15% when you buy 4 products from the same category!',
  alternates: {
    canonical: '/bundles',
  },
}

interface Bundle {
  _id: string
  name: string
  slug: string
  description: string
  image: string
  requiredQuantity: number
  discountPercentage: number
  category: string
  size: string
  isActive: boolean
}

async function getBundles(): Promise<Bundle[]> {
  try {
    await connectToDatabase()
    
    const BundleModel = mongoose.models.Bundle || mongoose.model('Bundle', new mongoose.Schema({
      name: String,
      slug: String,
      description: String,
      image: String,
      requiredQuantity: Number,
      discountPercentage: Number,
      category: String,
      size: String,
      isActive: Boolean,
      sortOrder: Number,
    }))
    
    const bundles = await BundleModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean()
    
    return bundles.map((b: any) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug,
      description: b.description,
      image: b.image,
      requiredQuantity: b.requiredQuantity,
      discountPercentage: b.discountPercentage,
      category: b.category,
      size: b.size,
      isActive: b.isActive,
    }))
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return []
  }
}

export default async function BundlesPage() {
  const bundles = await getBundles()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bundle Deals</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Save 15% when you buy 4 products from the same category! Mix and match within each bundle category to create your perfect selection.
          </p>
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-primary-800 font-medium">
              💡 How it works: Add 4 qualifying products to your cart and the 15% discount will be applied automatically!
            </p>
          </div>
        </div>

        {/* Bundle Categories Grid */}
        {bundles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No bundle deals available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <div
                key={bundle._id}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Bundle Image - Clickable */}
                <Link href={`/bundles/${bundle.slug}`}>
                  <div className="relative h-48 bg-gray-200 cursor-pointer">
                    {bundle.image ? (
                      <OptimizedImage
                        src={bundle.image}
                        alt={bundle.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 cursor-pointer">
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {bundle.category === 'flower' && '🌿'}
                            {bundle.category === 'hash' && '🟫'}
                            {bundle.category === 'shatter' && '💎'}
                          </div>
                          <p className="text-primary-700 font-medium">{bundle.category.toUpperCase()}</p>
                          <p className="text-primary-600 text-sm">{bundle.size}</p>
                        </div>
                      </div>
                    )}
                    {/* Discount Badge */}
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {bundle.discountPercentage}% OFF
                    </div>
                  </div>
                </Link>

                {/* Bundle Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bundle.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {bundle.description}
                  </p>
                  
                  {/* Shop Now CTA - Clickable */}
                  <div className="mt-4">
                    <Link href={`/bundles/${bundle.slug}`}>
                      <div className="w-full bg-primary-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                        Shop Now →
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bundle Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ What Qualifies</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Select any 4 products from the same bundle category</li>
                <li>• Products must match the specific size (28g or 7g)</li>
                <li>• Discount applies automatically at checkout</li>
                <li>• No coupon code needed</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">❌ Important Notes</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Cannot mix categories (e.g., flower + hash)</li>
                <li>• Cannot mix sizes (e.g., 28g + 7g)</li>
                <li>• Bundle discounts don't stack with coupon codes</li>
                <li>• Removing items may remove the discount</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
