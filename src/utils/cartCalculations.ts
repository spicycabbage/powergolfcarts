import { CartItem, Product } from '@/types'
import { calculateBundleDiscounts, BundleCalculationResult } from './bundleCalculations'

export interface CartCalculationResult {
  subtotal: number
  bundleDiscount: number
  tax: number
  shipping: number
  total: number
  bundleInfo?: BundleCalculationResult
}

export const TAX_RATE = 0.08
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 50
export const DEFAULT_SHIPPING_COST = 9.99

export function calculateCartTotals(items: CartItem[], options?: { freeShippingThreshold?: number, shippingCost?: number }): CartCalculationResult {
  const subtotal = items.reduce((total, item) => {
    const price = item.variant?.price || item.product.price
    console.log('💰 CART CALC DEBUG:', {
      productName: item.product.name,
      variantPrice: item.variant?.price,
      productPrice: item.product.price,
      finalPrice: price,
      quantity: item.quantity
    })
    return total + (price * item.quantity)
  }, 0)

  // Calculate bundle discounts
  const bundleInfo = calculateBundleDiscounts(items)
  const bundleDiscount = bundleInfo.totalBundleDiscount

  // Apply bundle discount to subtotal for tax and shipping calculations
  const discountedSubtotal = subtotal - bundleDiscount
  const tax = discountedSubtotal * TAX_RATE
  const threshold = options?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
  const baseShipping = options?.shippingCost ?? DEFAULT_SHIPPING_COST
  const shipping = discountedSubtotal > threshold ? 0 : baseShipping
  const total = discountedSubtotal + tax + shipping

  return { subtotal, bundleDiscount, tax, shipping, total, bundleInfo }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateItemTotal(item: CartItem): number {
  const price = item.variant?.price || item.product.price
  return price * item.quantity
}





