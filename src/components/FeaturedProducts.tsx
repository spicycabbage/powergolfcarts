'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import VariantCard from '@/components/product/VariantCard' // Import VariantCard

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const res = await fetch('/api/products?featured=true&limit=4')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data.data) ? data.data : [])
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (products.length === 0) {
    return null // Don't render the section if there are no featured products
  }

  return (
    <section className="bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 text-lg text-gray-600">
            Handpicked selections you're sure to love.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <VariantCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

