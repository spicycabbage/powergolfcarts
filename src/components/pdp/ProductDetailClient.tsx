'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { DynamicPriceDisplay } from './DynamicPriceDisplay'
import { ProductActions } from '../ProductActions'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Auto-select the first in-stock variant (or the first variant) on mount
  useEffect(() => {
    if (!selectedVariantId && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstInStock = product.variants.find(v => (v.inventory ?? 0) > 0)
      setSelectedVariantId((firstInStock || product.variants[0])._id)
    }
  }, [product.variants, selectedVariantId])

  return (
    <>
      {/* Price Display */}
      <DynamicPriceDisplay product={product} selectedVariantId={selectedVariantId} />

      {/* Product Actions */}
      <ProductActions 
        product={product} 
        selectedVariantId={selectedVariantId}
        onVariantChange={setSelectedVariantId}
      />
    </>
  )
}

