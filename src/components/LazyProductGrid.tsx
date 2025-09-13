'use client'

import { useState, useEffect, useRef } from 'react'
import VariantCard from '@/components/product/VariantCard'
import { serializeProductForClient } from '@/lib/serializers'

interface LazyProductGridProps {
  products: any[]
  initialCount?: number
  loadIncrement?: number
}

export function LazyProductGrid({ 
  products, 
  initialCount = 8, 
  loadIncrement = 8 
}: LazyProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && visibleCount < products.length && !isLoading) {
          setIsLoading(true)
          // Small delay to prevent rapid firing
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + loadIncrement, products.length))
            setIsLoading(false)
          }, 100)
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before the element is visible
        threshold: 0.1
      }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [visibleCount, products.length, loadIncrement, isLoading])

  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {visibleProducts.map((product, index) => (
          <VariantCard 
            key={String(product._id)} 
            product={serializeProductForClient(product) as any}
            priority={index < 4} // Only first 4 images get priority
          />
        ))}
      </div>

      {/* Loading trigger element */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Showing {visibleCount} of {products.length} products
            </div>
          )}
        </div>
      )}

      {/* Show completion message */}
      {!hasMore && products.length > initialCount && (
        <div className="text-center py-4 text-gray-500 text-sm">
          All {products.length} products loaded
        </div>
      )}
    </>
  )
}
