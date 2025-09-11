'use client'

import { useState, useEffect, useCallback } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Product } from '@/types'
import VariantCard from '@/components/product/VariantCard'

interface ProductListProps {
  category?: string
  limit?: number
}

export function ProductList({ category, limit }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const pageSize = limit || 24 // Use limit if provided, otherwise default to 24 per page

  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        ...(category && { category })
      })

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const result = await response.json()
      const newProducts = Array.isArray(result.data) ? result.data : []
      
      if (reset || pageNum === 1) {
        setProducts(newProducts)
      } else {
        setProducts(prev => [...prev, ...newProducts])
      }
      
      // If we got fewer products than requested, we've reached the end
      setHasMore(newProducts.length === pageSize)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, pageSize])

  // Load initial products
  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
  }, [fetchProducts])

  // Infinite scroll handler
  useEffect(() => {
    if (!limit) { // Only enable infinite scroll when no limit is set
      const handleScroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop
          >= document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
          hasMore &&
          !loading &&
          !loadingMore
        ) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchProducts(nextPage)
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [page, hasMore, loading, loadingMore, fetchProducts, limit])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchProducts(1, true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <VariantCard key={product._id} product={product} />
        ))}
      </div>
      
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <LoadingSpinner />
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <div className="text-center mt-8 py-4 text-gray-500">
          You've reached the end of our products!
        </div>
      )}
      
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found.</p>
        </div>
      )}
    </div>
  )
}

