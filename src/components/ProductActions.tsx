'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    try {
      // Pass null as variant for now since we don't have variant selection
      addItem(product, quantity, null)
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

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <span className="font-medium text-gray-900">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            disabled={!product.inventory.quantity || product.inventory.quantity <= 0}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-center min-w-[3rem] border-l border-r border-gray-300">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(quantity + 1, product.inventory.quantity))}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            disabled={!product.inventory.quantity || product.inventory.quantity <= 0 || quantity >= product.inventory.quantity}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddToCart}
          disabled={!product.inventory.quantity || product.inventory.quantity <= 0}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {product.inventory.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
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
