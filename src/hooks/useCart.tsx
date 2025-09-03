'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, CartItem, Product } from '@/types'
import { calculateCartTotals, calculateItemTotal } from '@/utils/cartCalculations'

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
        console.log('Cart hook - addItem called with:', product._id, quantity, variant)
        const { cart } = get()
        const existingItemIndex = cart.items.findIndex(
          item => {
            // Handle undefined/null variant matching more robustly
            const itemVariant = item.variant ?? null
            const searchVariant = variant ?? null
            const variantMatch = itemVariant === searchVariant ||
                                (itemVariant == null && searchVariant == null)
            console.log('Cart hook - checking existing item:', item.product._id, 'itemVariant:', itemVariant, 'searchVariant:', searchVariant, 'variantMatch:', variantMatch)
            return item.product._id === product._id && variantMatch
          }
        )

        let newItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newItems = [...cart.items]
          newItems[existingItemIndex].quantity += quantity
        } else {
          // Add new item
          console.log('Cart hook - adding new item:', product._id, variant, quantity)
          newItems = [...cart.items, {
            product,
            variant,
            quantity
          }]
        }

        const cartTotals = calculateCartTotals(newItems)

        set({
          cart: {
            items: newItems,
            ...cartTotals
          }
        })
      },

      removeItem: (productId: string, variant) => {
        console.log('Cart hook - removeItem called with:', productId, variant)
        const { cart } = get()
        console.log('Cart hook - current cart items:', cart.items.map(item => ({ id: item.product._id, variant: item.variant })))

        const newItems = cart.items.filter(
          item => {
            // Handle undefined/null variant matching more robustly
            const itemVariant = item.variant ?? null
            const searchVariant = variant ?? null
            const variantMatch = itemVariant === searchVariant ||
                                (itemVariant == null && searchVariant == null)
            const shouldRemove = item.product._id === productId && variantMatch
            console.log('Cart hook - checking item:', item.product._id, 'itemVariant:', itemVariant, 'searchVariant:', searchVariant, 'shouldRemove:', shouldRemove)
            return !shouldRemove
          }
        )

        console.log('Cart hook - new items after filter:', newItems.map(item => ({ id: item.product._id, variant: item.variant })))

        const cartTotals = calculateCartTotals(newItems)

        set({
          cart: {
            items: newItems,
            ...cartTotals
          }
        })
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
            return { ...item, quantity }
          }
          return item
        })

        const cartTotals = calculateCartTotals(newItems)

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
          console.log('Migrating cart from old version, clearing cart')
          return { cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 } }
        }
        // Also clear any cart with old variant structure
        if (persistedState?.cart?.items?.length > 0) {
          console.log('Checking cart for old variant structure...')
          const hasOldVariants = persistedState.cart.items.some((item: any) => {
            return item.variant !== null && item.variant !== undefined &&
                   typeof item.variant === 'object' && !item.variant.name
          })
          if (hasOldVariants) {
            console.log('Found old variant structure, clearing cart')
            return { cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 } }
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
    totalPrice: store.getTotalPrice(),
    // Debug function to help troubleshoot cart issues
    debugCart: () => {
      console.log('Current cart state:', store.cart)
      console.log('Cart items with variants:', store.cart.items.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        variant: item.variant,
        quantity: item.quantity
      })))
    }
  }
}

