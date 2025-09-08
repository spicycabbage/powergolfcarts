import { Metadata } from 'next'
import { ProductList } from '@/components/ProductList'

export const metadata: Metadata = {
  title: 'Products | E-Commerce Store',
  description: 'Browse our complete product catalog with advanced filtering and search.',
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-2">Discover our complete product catalog</p>
            </div>
            <div className="flex items-center space-x-4" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <ProductList limit={24} />
        </main>
      </div>
    </div>
  )
}






