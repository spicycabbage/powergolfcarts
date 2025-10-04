'use client'

import { useMemo } from 'react'
import { Product } from '@/types'

interface DynamicPriceDisplayProps {
  product: Product
  selectedVariantId: string | null
}

export function DynamicPriceDisplay({ product, selectedVariantId }: DynamicPriceDisplayProps) {
  const { price, originalPrice, discountPercent } = useMemo(() => {
    // Find selected variant
    const selectedVariant = selectedVariantId && Array.isArray(product.variants)
      ? product.variants.find(v => v._id === selectedVariantId)
      : null

    // Get prices from variant or product
    const currentPrice = selectedVariant?.price ?? product.price
    const regularPrice = selectedVariant?.originalPrice ?? product.originalPrice

    // Calculate effective prices
    const effectivePrice = Number(currentPrice ?? regularPrice ?? 0)
    const effectiveOriginalPrice = regularPrice ? Number(regularPrice) : null

    // Calculate discount percentage
    let discount = 0
    if (effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice) {
      discount = Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    }

    return {
      price: effectivePrice,
      originalPrice: effectiveOriginalPrice,
      discountPercent: discount
    }
  }, [product, selectedVariantId])

  return (
    <div className="flex items-center space-x-4">
      <span className="text-3xl font-bold text-gray-900">
        ${price.toFixed(2)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-xl text-gray-500 line-through">
          ${originalPrice.toFixed(2)}
        </span>
      )}
      {originalPrice && originalPrice > price && discountPercent > 0 && (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
          {discountPercent}% OFF
        </span>
      )}
    </div>
  )
}

