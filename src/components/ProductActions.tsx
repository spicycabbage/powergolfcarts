'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const { addItem } = useCart()

  const selectedVariant = useMemo(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) return null
    return product.variants.find(v => v._id === selectedVariantId) || null
  }, [product.variants, selectedVariantId])

  // Auto-select the first in-stock variant (or the first variant) on mount
  useEffect(() => {
    if (!selectedVariantId && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstInStock = product.variants.find(v => (v.inventory ?? 0) > 0)
      setSelectedVariantId((firstInStock || product.variants[0])._id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.variants])

  const handleAddToCart = () => {
    try {
      const variantPayload = selectedVariant ? {
        _id: selectedVariant._id,
        name: selectedVariant.name,
        value: selectedVariant.value,
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice,
        sku: selectedVariant.sku,
        inventory: selectedVariant.inventory,
      } : null
      addItem(product, quantity, variantPayload)
      toast.success(`Added ${quantity} x ${product.name} to cart`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const handleAddToWishlist = () => {
    // Add to wishlist logic here
    console.log(`Added ${product.name} to wishlist`)
  }

  const handleShare = () => {
    // Share logic here
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const effectivePrice = useMemo(() => {
    const variantPrice = selectedVariant?.price ?? selectedVariant?.originalPrice
    const basePrice = product.price ?? product.originalPrice
    return Number(variantPrice ?? basePrice ?? 0)
  }, [selectedVariant, product.price, product.originalPrice])
  const totalPrice = useMemo(() => {
    const unit = Number.isFinite(effectivePrice) ? effectivePrice : 0
    return Math.max(0, unit * Math.max(1, quantity))
  }, [effectivePrice, quantity])

  return (
    <div className="space-y-5">
      {/* Variant Selector */}
      {Array.isArray(product.variants) && product.variants.length > 0 && (
        <div>
          <span className="font-medium text-gray-900">Choose Option</span>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.variants.map(v => {
              const isSelected = selectedVariantId === v._id
              const disabled = v.inventory <= 0
              const priceNum = v.price != null
                ? Number(v.price)
                : (v.originalPrice != null
                    ? Number(v.originalPrice)
                    : (product.price != null ? Number(product.price) : NaN))
              const label = String(v.value || '').trim()
              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => setSelectedVariantId(v._id)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className={`h-20 rounded-xl border-2 p-3 text-left transition-all flex flex-col justify-center ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="text-sm truncate">{label}</span>
                  <span className="text-lg font-semibold">{Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : '—'}</span>
                  {disabled && <div className="text-xs text-red-600 mt-0.5">Out of stock</div>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity + Add to Cart (compact container) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">Quantity</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              disabled={(selectedVariant ? selectedVariant.inventory <= 0 : (!product.inventory.quantity || product.inventory.quantity <= 0))}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-center min-w-[3rem] border-l border-r border-gray-300">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(
                Math.min(
                  quantity + 1,
                  selectedVariant ? selectedVariant.inventory : product.inventory.quantity
                )
              )}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              disabled={
                selectedVariant
                  ? (selectedVariant.inventory <= 0 || quantity >= selectedVariant.inventory)
                  : (!product.inventory.quantity || product.inventory.quantity <= 0 || quantity >= product.inventory.quantity)
              }
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant ? selectedVariant.inventory <= 0 : (!product.inventory.quantity || product.inventory.quantity <= 0)}
          className="w-full h-12 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed clickable"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {(selectedVariant ? selectedVariant.inventory > 0 : product.inventory.quantity > 0)
            ? `Add to Cart - $${totalPrice.toFixed(2)}`
            : 'Out of Stock'}
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAddToWishlist}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <Heart className="w-5 h-5 mr-2" />
          Add to Wishlist
        </button>
        <button
          onClick={handleShare}
          className="p-3 border border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          title="Share product"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
