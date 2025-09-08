import { CartItem, Product } from '@/types'

export interface CartCalculationResult {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export const TAX_RATE = 0.08
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 50
export const DEFAULT_SHIPPING_COST = 9.99

export function calculateCartTotals(items: CartItem[], options?: { freeShippingThreshold?: number, shippingCost?: number }): CartCalculationResult {
  const subtotal = items.reduce((total, item) => {
    const price = item.variant?.price || item.product.price
    return total + (price * item.quantity)
  }, 0)

  const tax = subtotal * TAX_RATE
  const threshold = options?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
  const baseShipping = options?.shippingCost ?? DEFAULT_SHIPPING_COST
  const shipping = subtotal > threshold ? 0 : baseShipping
  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }
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





