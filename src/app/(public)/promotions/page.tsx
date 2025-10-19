import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Promotions & Deals | Power Golf Carts',
  description: 'Check out our current promotions and special offers on electric golf carts and accessories',
  alternates: {
    canonical: '/promotions',
  },
}

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Current Promotions</h1>
          <p className="text-xl text-gray-600">Special offers and deals on premium golf cart products</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Shipping</h2>
            <p className="text-gray-700 mb-4">
              Get free shipping on all orders within the USA!
            </p>
            <Link 
              href="/categories"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Shop Now →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Back Soon</h2>
            <p className="text-gray-700 mb-4">
              More exciting promotions and seasonal deals coming your way!
            </p>
            <Link 
              href="/categories/electric-carts"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Electric Carts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

