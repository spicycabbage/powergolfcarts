'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, CartItem, Product } from '@/types'
import { calculateCartTotals, calculateItemTotal, DEFAULT_FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from '@/utils/cartCalculations'
import toast from 'react-hot-toast'

interface CartStore {
  cart: Cart
  addItem: (product: Product, quantity?: number, variant?: any) => void
  removeItem: (productId: string, variant?: any) => void
  updateQuantity: (productId: string, quantity: number, variant?: any) => void
  clearCart: () => void
  getItemCount: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      },

      addItem: (product: Product, quantity = 1, variant) => {
        const compactProduct = (p: any): Product => ({
          // Minimal shape required by UI; cast to Product for typing
          _id: String(p._id) as any,
          name: String(p.name),
          slug: String(p.slug),
          description: String(p.description || ''),
          shortDescription: String(p.shortDescription || ''),
          price: Number(p.price ?? 0) as any,
          originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined as any,
          images: Array.isArray(p.images)
            ? p.images.slice(0, 1).map((img: any, idx: number) => ({
                _id: String((img && img._id) || idx) as any,
                url: String(typeof img === 'string' ? img : img?.url || ''),
                alt: String(typeof img === 'string' ? p.name : img?.alt || p.name || ''),
                width: Number(typeof img === 'string' ? 800 : img?.width || 800) as any,
                height: Number(typeof img === 'string' ? 800 : img?.height || 800) as any,
                isPrimary: Boolean(typeof img === 'string' ? idx === 0 : img?.isPrimary) as any,
              })) as any
            : ([] as any),
          category: (p.category ? { _id: String(p.category?._id || p.category), name: String(p.category?.name || ''), slug: String(p.category?.slug || '') } : { _id: '' as any, name: '', slug: '' }) as any,
          categories: [] as any,
          tags: [] as any,
          inventory: {
            // If product has variants, derive available inventory from sum of variant inventories
            quantity: (Array.isArray(p.variants) && p.variants.length > 0)
              ? Number(p.variants.reduce((s: number, v: any) => s + Number(v?.inventory || 0), 0)) as any
              : Number(p.inventory?.quantity || 0) as any,
            lowStockThreshold: Number(p.inventory?.lowStockThreshold || 5) as any,
            sku: String(p.inventory?.sku || '') as any,
            trackInventory: Boolean(p.inventory?.trackInventory ?? true) as any,
          } as any,
          seo: { title: String(p.seo?.title || ''), description: String(p.seo?.description || ''), keywords: [] } as any,
          variants: [] as any,
          reviews: [] as any,
          averageRating: Number(p.averageRating || 0) as any,
          reviewCount: Number(p.reviewCount || 0) as any,
          isActive: Boolean(p.isActive) as any,
          isFeatured: Boolean(p.isFeatured) as any,
          createdAt: new Date(p.createdAt || Date.now()) as any,
          updatedAt: new Date(p.updatedAt || Date.now()) as any,
        })
        const { cart } = get()
        const existingItemIndex = cart.items.findIndex(
          item => {
            // Handle undefined/null variant matching more robustly
            const itemVariant = item.variant ?? null
            const searchVariant = variant ?? null
            const variantMatch = itemVariant === searchVariant ||
                                (itemVariant == null && searchVariant == null)
            return item.product._id === product._id && variantMatch
          }
        )

        let newItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update existing item quantity with stock cap
          newItems = [...cart.items]
          const currentQty = Number(newItems[existingItemIndex].quantity || 0)
          const maxStock = variant && typeof variant?.inventory === 'number'
            ? Number(variant.inventory)
            : Number((product as any)?.inventory?.quantity || 0)
          const desired = currentQty + quantity
          const nextQty = Math.min(desired, Math.max(0, maxStock))
          if (desired > nextQty) {
            toast.error('Cannot add more than available stock')
          }
          newItems[existingItemIndex].quantity = nextQty
        } else {
          // Add new item (store compact product to shrink persisted size)
          const maxStock = variant && typeof variant?.inventory === 'number'
            ? Number(variant.inventory)
            : Number((product as any)?.inventory?.quantity || 0)
          const initialQty = Math.min(quantity, Math.max(0, maxStock))
          if (initialQty < quantity) {
            toast.error('Quantity adjusted to available stock')
          }
          newItems = [...cart.items, {
            product: compactProduct(product),
            variant,
            quantity: initialQty
          }]
        }

        const dyn = (globalThis as any).__shipping_config__ as { freeShippingThreshold?: number, defaultMethodPrice?: number } | undefined
        const cartTotals = calculateCartTotals(newItems, {
          freeShippingThreshold: dyn?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
          shippingCost: dyn?.defaultMethodPrice ?? DEFAULT_SHIPPING_COST,
        })

        set({
          cart: {
            items: newItems,
            ...cartTotals
          }
        })

        // Add success toast for adding items
        if (existingItemIndex >= 0) {
          toast.success('Cart updated')
        } else {
          toast.success('Added to cart')
        }
      },

      removeItem: (productId: string, variant) => {
        const { cart } = get()

        const newItems = cart.items.filter(
          item => {
            // Handle undefined/null variant matching more robustly
            const itemVariant = item.variant ?? null
            const searchVariant = variant ?? null
            const variantMatch = itemVariant === searchVariant ||
                                (itemVariant == null && searchVariant == null)
            return !(item.product._id === productId && variantMatch)
          }
        )

        const dyn = (globalThis as any).__shipping_config__ as { freeShippingThreshold?: number, defaultMethodPrice?: number } | undefined
        const cartTotals = calculateCartTotals(newItems, {
          freeShippingThreshold: dyn?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
          shippingCost: dyn?.defaultMethodPrice ?? DEFAULT_SHIPPING_COST,
        })

        set({
          cart: {
            items: newItems,
            ...cartTotals
          }
        })

        // Add toast notification for feedback
        toast.success('Item removed from cart')
      },

      updateQuantity: (productId: string, quantity: number, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant)
          return
        }

        const { cart } = get()
        const newItems = cart.items.map(item => {
          // Handle undefined/null variant matching more robustly
          const itemVariant = item.variant ?? null
          const searchVariant = variant ?? null
          const variantMatch = itemVariant === searchVariant ||
                              (itemVariant == null && searchVariant == null)
          if (item.product._id === productId && variantMatch) {
            // Cap quantity to available stock
            const maxStock = searchVariant && typeof (searchVariant as any)?.inventory === 'number'
              ? Number((searchVariant as any).inventory)
              : Number((item.product as any)?.inventory?.quantity || 0)
            const nextQty = Math.min(quantity, Math.max(0, maxStock))
            if (quantity > nextQty) {
              toast.error('Cannot exceed available stock')
            }
            return { ...item, quantity: nextQty }
          }
          return item
        })

        const dyn = (globalThis as any).__shipping_config__ as { freeShippingThreshold?: number, defaultMethodPrice?: number } | undefined
        const cartTotals = calculateCartTotals(newItems, {
          freeShippingThreshold: dyn?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
          shippingCost: dyn?.defaultMethodPrice ?? DEFAULT_SHIPPING_COST,
        })

        set({
          cart: {
            items: newItems,
            ...cartTotals
          }
        })
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0
          }
        })
      },

      getItemCount: () => {
        const { cart } = get()
        return cart.items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const { cart } = get()
        return cart.total
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
      // Add version to handle breaking changes
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          // Clear old cart data if version is old
          return { cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 } }
        }
        // Also clear any cart with old variant structure
        if (persistedState?.cart?.items?.length > 0) {
          const hasOldVariants = persistedState.cart.items.some((item: any) => {
            return item.variant !== null && item.variant !== undefined &&
                   typeof item.variant === 'object' && !item.variant.name
          })
          if (hasOldVariants) {
            return { cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 } }
          }
          // Compact existing products to minimal shape to reduce payload
          try {
            const compactedItems = persistedState.cart.items.map((it: any) => ({
              ...it,
              product: {
                _id: String(it.product?._id || ''),
                name: String(it.product?.name || ''),
                slug: String(it.product?.slug || ''),
                description: String(it.product?.description || ''),
                shortDescription: String(it.product?.shortDescription || ''),
                price: Number(it.product?.price ?? 0),
                originalPrice: it.product?.originalPrice != null ? Number(it.product.originalPrice) : undefined,
                images: Array.isArray(it.product?.images) && it.product.images.length > 0 ? [
                  (typeof it.product.images[0] === 'string'
                    ? { _id: '0', url: String(it.product.images[0]), alt: String(it.product?.name || ''), width: 800, height: 800, isPrimary: true }
                    : { _id: String(it.product.images[0]?._id || '0'), url: String(it.product.images[0]?.url || ''), alt: String(it.product.images[0]?.alt || it.product?.name || ''), width: Number(it.product.images[0]?.width || 800), height: Number(it.product.images[0]?.height || 800), isPrimary: Boolean(it.product.images[0]?.isPrimary) }
                  )
                ] : [],
                category: { _id: '', name: '', slug: '' },
                categories: [],
                tags: [],
                inventory: {
                  quantity: Number(it.product?.inventory?.quantity || 0),
                  lowStockThreshold: Number(it.product?.inventory?.lowStockThreshold || 5),
                  sku: String(it.product?.inventory?.sku || ''),
                  trackInventory: Boolean(it.product?.inventory?.trackInventory ?? true)
                },
                seo: { title: String(it.product?.seo?.title || ''), description: String(it.product?.seo?.description || ''), keywords: [] },
                variants: [],
                reviews: [],
                averageRating: Number(it.product?.averageRating || 0),
                reviewCount: Number(it.product?.reviewCount || 0),
                isActive: Boolean(it.product?.isActive),
                isFeatured: Boolean(it.product?.isFeatured),
                createdAt: new Date(it.product?.createdAt || Date.now()),
                updatedAt: new Date(it.product?.updatedAt || Date.now()),
              }
            }))
            return { cart: { ...persistedState.cart, items: compactedItems } }
          } catch {
            return persistedState
          }
        }
        return persistedState
      }
    }
  )
)

// Hook for easier usage
export function useCart() {
  const store = useCartStore()
  return {
    cart: store.cart,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    itemCount: store.getItemCount(),
    totalPrice: store.getTotalPrice()
  }
}

