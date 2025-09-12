/**
 * Product utility functions for common calculations and operations
 */

export interface ProductInventory {
  trackInventory?: boolean
  quantity?: number
  lowStockThreshold?: number
}

export interface ProductPricing {
  price: number
  originalPrice?: number
}

/**
 * Calculate discount percentage for a product
 */
export function calculateDiscountPercentage(product: ProductPricing): number {
  if (!product.originalPrice || product.originalPrice <= product.price) {
    return 0
  }
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}

/**
 * Determine stock status for a product
 */
export function getStockStatus(inventory: ProductInventory): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (!inventory?.trackInventory) {
    return 'in_stock'
  }
  
  const quantity = inventory.quantity || 0
  const threshold = inventory.lowStockThreshold || 0
  
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= threshold) return 'low_stock'
  return 'in_stock'
}

/**
 * Add virtual fields to a product object
 */
export function addProductVirtuals<T extends ProductPricing & { inventory?: ProductInventory }>(
  product: T
): T & { discountPercentage: number; stockStatus: string } {
  return {
    ...product,
    discountPercentage: calculateDiscountPercentage(product),
    stockStatus: getStockStatus(product.inventory || {})
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(price)
}

/**
 * Check if product is on sale
 */
export function isOnSale(product: ProductPricing): boolean {
  return !!(product.originalPrice && product.originalPrice > product.price)
}

/**
 * Get product availability text
 */
export function getAvailabilityText(inventory: ProductInventory): string {
  const status = getStockStatus(inventory)
  
  switch (status) {
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return `Low Stock (${inventory.quantity || 0} left)`
    case 'in_stock':
    default:
      return inventory?.trackInventory 
        ? `In Stock (${inventory.quantity || 0} available)`
        : 'In Stock'
  }
}
