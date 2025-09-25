'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, Heart, Share2, Minus, Plus, Copy, Check } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loadingReferralCode, setLoadingReferralCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const { addItem } = useCart()
  const { data: session } = useSession()

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
    // TODO: Implement wishlist functionality
  }

  // Fetch user's existing referral code
  const fetchReferralCode = async () => {
    if (!session?.user) return null
    
    setLoadingReferralCode(true)
    try {
      const response = await fetch('/api/referrals/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralCode(data.referralCode)
        return data.referralCode
      }
    } catch (error) {
      console.error('Failed to fetch referral code:', error)
    } finally {
      setLoadingReferralCode(false)
    }
    return null
  }

  const handleShare = async () => {
    if (session?.user) {
      // For logged-in users, show referral share modal
      setShowShareModal(true)
      if (!referralCode) {
        await fetchReferralCode()
      }
    } else {
      // For non-logged-in users, use simple share
      const url = window.location.href
      if (navigator.share) {
        navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: url,
        })
      } else {
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    }
  }

  const getReferralUrl = () => {
    if (!referralCode) return window.location.href
    const url = new URL(window.location.href)
    url.searchParams.set('ref', referralCode)
    return url.toString()
  }

  const copyReferralLink = async () => {
    const url = getReferralUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const shareNative = async () => {
    const url = getReferralUrl()
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} - you'll get a great deal and I'll earn some rewards!`,
          url: url,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyReferralLink()
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
          onClick={handleShare}
          className="w-full mt-2 text-sm text-gray-600 hover:text-primary-600 flex items-center justify-center p-2 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {session?.user ? 'Share & Earn' : 'Share'}
        </button>
      </div>

      {/* Referral Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share & Earn Rewards</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Share this product with friends and earn loyalty points when they make a purchase!
              </p>
              
              {loadingReferralCode ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : referralCode ? (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Your referral code:</p>
                    <p className="font-mono font-semibold text-primary-600">{referralCode}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Your referral link:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={getReferralUrl()}
                        readOnly
                        className="flex-1 text-xs bg-white border rounded px-2 py-1 text-gray-700"
                      />
                      <button
                        onClick={copyReferralLink}
                        className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition-colors"
                      >
                        {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedLink ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={shareNative}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Share Now
                    </button>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-600">Failed to load referral code</p>
                  <button
                    onClick={fetchReferralCode}
                    className="mt-2 text-primary-600 hover:text-primary-700"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
