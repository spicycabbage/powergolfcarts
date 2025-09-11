'use client'

import { ApiDataFetcher } from '@/components/ui/DataFetcher'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Product } from '@/types'
import VariantCard from '@/components/product/VariantCard'

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
    <ApiDataFetcher<Product[]>
      queryKey={['products', category || '', limit.toString()]}
      queryFn={fetchProducts}
      staleTime={5 * 60 * 1000} // 5 minutes
    >
      {(data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.map((product) => (
            <VariantCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </ApiDataFetcher>
  )
}

