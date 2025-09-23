import { CartItem } from '@/types'

export interface BundleDiscount {
  bundleType: string
  bundleName: string
  requiredQuantity: number
  discountPercentage: number
  qualifyingItems: CartItem[]
  totalItems: number
  discountAmount: number
  isQualified: boolean
}

export interface BundleCalculationResult {
  bundleDiscounts: BundleDiscount[]
  totalBundleDiscount: number
  hasQualifiedBundles: boolean
}

// Bundle configurations matching the database
const BUNDLE_CONFIGS = {
  'flower-28g': { name: 'Flower 4x28g Bundle', skuFilter: 'FLO28G', requiredQuantity: 4, discountPercentage: 15 },
  'hash-28g': { name: 'Hash 4x28g Bundle', skuFilter: 'HAS28G', requiredQuantity: 4, discountPercentage: 15 },
  'shatter-28g': { name: 'Shatter 4x28g Bundle', skuFilter: 'SHA28G', requiredQuantity: 4, discountPercentage: 15 },
  'flower-7g': { name: 'Flower 4x7g Bundle', skuFilter: 'FLO07G', requiredQuantity: 4, discountPercentage: 15 },
  'hash-7g': { name: 'Hash 4x7g Bundle', skuFilter: 'HAS07G', requiredQuantity: 4, discountPercentage: 15 },
  'shatter-7g': { name: 'Shatter 4x7g Bundle', skuFilter: 'SHA07G', requiredQuantity: 4, discountPercentage: 15 }
}

export function calculateBundleDiscounts(items: CartItem[]): BundleCalculationResult {
  const bundleDiscounts: BundleDiscount[] = []
  let totalBundleDiscount = 0

  // Group items by their SKU patterns to identify bundle eligibility
  const bundleGroups: { [key: string]: CartItem[] } = {}

  items.forEach(item => {
    const sku = item.variant?.sku || item.product.inventory?.sku || ''
    
    // Only match items that contain the EXACT bundle SKU filter
    if (sku.includes('FLO28G')) {
      if (!bundleGroups['flower-28g']) bundleGroups['flower-28g'] = []
      bundleGroups['flower-28g'].push(item)
    } else if (sku.includes('FLO07G')) {
      if (!bundleGroups['flower-7g']) bundleGroups['flower-7g'] = []
      bundleGroups['flower-7g'].push(item)
    } else if (sku.includes('HAS28G')) {
      if (!bundleGroups['hash-28g']) bundleGroups['hash-28g'] = []
      bundleGroups['hash-28g'].push(item)
    } else if (sku.includes('HAS07G')) {
      if (!bundleGroups['hash-7g']) bundleGroups['hash-7g'] = []
      bundleGroups['hash-7g'].push(item)
    } else if (sku.includes('SHA28G')) {
      if (!bundleGroups['shatter-28g']) bundleGroups['shatter-28g'] = []
      bundleGroups['shatter-28g'].push(item)
    } else if (sku.includes('SHA07G')) {
      if (!bundleGroups['shatter-7g']) bundleGroups['shatter-7g'] = []
      bundleGroups['shatter-7g'].push(item)
    }
  })

  // Calculate discounts for each bundle group
  Object.entries(bundleGroups).forEach(([bundleType, bundleItems]) => {
    const config = BUNDLE_CONFIGS[bundleType as keyof typeof BUNDLE_CONFIGS]
    if (!config) return

    const totalQuantity = bundleItems.reduce((sum, item) => sum + item.quantity, 0)
    const isQualified = totalQuantity >= config.requiredQuantity

    let discountAmount = 0
    if (isQualified) {
      // Calculate discount on the qualifying items
      const itemsSubtotal = bundleItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price
        return sum + (price * item.quantity)
      }, 0)
      discountAmount = itemsSubtotal * (config.discountPercentage / 100)
      totalBundleDiscount += discountAmount
    }

    bundleDiscounts.push({
      bundleType,
      bundleName: config.name,
      requiredQuantity: config.requiredQuantity,
      discountPercentage: config.discountPercentage,
      qualifyingItems: bundleItems,
      totalItems: totalQuantity,
      discountAmount,
      isQualified
    })
  })

  return {
    bundleDiscounts,
    totalBundleDiscount,
    hasQualifiedBundles: bundleDiscounts.some(bundle => bundle.isQualified)
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

