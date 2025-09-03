'use client'

import { ApiDataFetcher } from '@/components/ui/DataFetcher'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Product } from '@/types'
import { formatCurrency } from '@/utils/cartCalculations'

interface ProductListProps {
  category?: string
  limit?: number
}

export function ProductList({ category, limit = 12 }: ProductListProps) {
  const fetchProducts = async () => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(category && { category })
    })

    const response = await fetch(`/api/products?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  }

  return (
    <ApiDataFetcher
      queryKey={['products', category || '', limit.toString()]}
      queryFn={fetchProducts}
      staleTime={5 * 60 * 1000} // 5 minutes
    >
      {(data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </ApiDataFetcher>
  )
}

interface ProductCardProps {
  product: Product & { rating?: number; isNew?: boolean; inStock?: boolean }
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square bg-gray-100 relative">
        {product.images[0] && (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.shortDescription || product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {product.averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 ml-1">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        <button className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
