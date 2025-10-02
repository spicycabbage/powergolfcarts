import { Currency } from './geoDetection'
import { Product, ProductVariant } from '@/types'

/**
 * Get the appropriate price for a product based on currency
 */
export function getProductPrice(product: Product, currency: Currency): number {
  switch (currency) {
    case 'USD':
      return product.priceUSD || product.price || 0
    case 'CAD':
      return product.priceCAD || product.price || 0
    default:
      return product.priceUSD || product.price || 0
  }
}

/**
 * Get the appropriate original price for a product based on currency
 */
export function getProductOriginalPrice(product: Product, currency: Currency): number | undefined {
  switch (currency) {
    case 'USD':
      return product.originalPriceUSD || product.originalPrice
    case 'CAD':
      return product.originalPriceCAD || product.originalPrice
    default:
      return product.originalPriceUSD || product.originalPrice
  }
}

/**
 * Get the appropriate price for a product variant based on currency
 */
export function getVariantPrice(variant: ProductVariant, currency: Currency): number {
  switch (currency) {
    case 'USD':
      return variant.priceUSD || variant.price || 0
    case 'CAD':
      return variant.priceCAD || variant.price || 0
    default:
      return variant.priceUSD || variant.price || 0
  }
}

/**
 * Get the appropriate original price for a product variant based on currency
 */
export function getVariantOriginalPrice(variant: ProductVariant, currency: Currency): number | undefined {
  switch (currency) {
    case 'USD':
      return variant.originalPriceUSD || variant.originalPrice
    case 'CAD':
      return variant.originalPriceCAD || variant.originalPrice
    default:
      return variant.originalPriceUSD || variant.originalPrice
  }
}

/**
 * Check if a product has a sale price (original price > current price)
 */
export function hasSalePrice(product: Product, currency: Currency): boolean {
  const originalPrice = getProductOriginalPrice(product, currency)
  const currentPrice = getProductPrice(product, currency)
  return originalPrice !== undefined && originalPrice > currentPrice
}

/**
 * Calculate the discount percentage for a product
 */
export function getDiscountPercentage(product: Product, currency: Currency): number {
  const originalPrice = getProductOriginalPrice(product, currency)
  const currentPrice = getProductPrice(product, currency)
  
  if (!originalPrice || originalPrice <= currentPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Check if a variant has a sale price
 */
export function hasVariantSalePrice(variant: ProductVariant, currency: Currency): boolean {
  const originalPrice = getVariantOriginalPrice(variant, currency)
  const currentPrice = getVariantPrice(variant, currency)
  return originalPrice !== undefined && originalPrice > currentPrice
}

/**
 * Calculate the discount percentage for a variant
 */
export function getVariantDiscountPercentage(variant: ProductVariant, currency: Currency): number {
  const originalPrice = getVariantOriginalPrice(variant, currency)
  const currentPrice = getVariantPrice(variant, currency)
  
  if (!originalPrice || originalPrice <= currentPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}
