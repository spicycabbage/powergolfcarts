'use client'

import React from 'react'
import { useCurrentCurrency } from '@/contexts/CurrencyContext'
import { formatPrice } from '@/lib/geoDetection'
import { getProductPrice, getProductOriginalPrice, hasSalePrice, getDiscountPercentage } from '@/lib/pricing'
import { Product } from '@/types'

interface ProductPriceProps {
  product: Product
  className?: string
  showDiscount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProductPrice({ 
  product, 
  className = '', 
  showDiscount = true,
  size = 'md'
}: ProductPriceProps) {
  const currency = useCurrentCurrency()
  
  const currentPrice = getProductPrice(product, currency)
  const originalPrice = getProductOriginalPrice(product, currency)
  const hasSale = hasSalePrice(product, currency)
  const discountPercentage = getDiscountPercentage(product, currency)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const originalSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex flex-col">
        <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
          {formatPrice(currentPrice, currency)}
        </span>
        
        {hasSale && originalPrice && (
          <span className={`text-gray-500 line-through ${originalSizeClasses[size]}`}>
            {formatPrice(originalPrice, currency)}
          </span>
        )}
      </div>
      
      {hasSale && showDiscount && discountPercentage > 0 && (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
          -{discountPercentage}%
        </span>
      )}
    </div>
  )
}
