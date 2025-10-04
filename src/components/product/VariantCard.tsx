'use client'

import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useMemo, useState } from 'react'
import { normalizeImageUrl } from '@/utils/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { ProductRating } from '@/components/ProductRating'
import ProductBadge from './ProductBadge'

type Variant = {
  _id?: string
  name?: string
  value?: string
  price?: number
  originalPrice?: number
  sku?: string
  inventory?: number
}

type Badge = {
  text: string
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray' | 'black'
}

type ProductBadges = {
  topLeft?: Badge
  topRight?: Badge
  bottomLeft?: Badge
  bottomRight?: Badge
}

type CardProduct = {
  _id?: string
  name: string
  slug: string
  images?: any[]
  price?: number
  originalPrice?: number
  averageRating?: number
  reviewCount?: number
  inventory?: { quantity?: number }
  variants?: Variant[]
  badges?: ProductBadges
}

export default function VariantCard({ product, priority = false }: { product: CardProduct, priority?: boolean }) {
  const { addItem } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Auto-select first variant if none selected
  const effectiveVariantId = selectedVariantId || (Array.isArray(product.variants) && product.variants.length > 0 ? String(product.variants[0]._id) : null)

  const selectedVariant = useMemo(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) return null
    return (product.variants as any[]).find(v => String(v?._id) === String(effectiveVariantId)) || null
  }, [product, effectiveVariantId])

  const imageSrc = useMemo(() => {
    const img = (product as any).images?.[0]
    const src = normalizeImageUrl(img)
    if (!src || src.trim() === '' || src === '/favicon.ico') {
      return '/placeholder-product.jpg'
    }
    return src
  }, [product])

  const canAdd = useMemo(() => {
    if (selectedVariant) return (selectedVariant.inventory || 0) > 0
    if (Array.isArray(product.variants) && product.variants.length > 0) return false
    return (product.inventory?.quantity || 0) > 0
  }, [product.variants, product.inventory, selectedVariant])

  const onAdd = () => {
    console.log('🔍 VARIANT DEBUG:')
    console.log('Selected Variant:', selectedVariant)
    console.log('Variant price:', selectedVariant?.price)
    console.log('Variant originalPrice:', selectedVariant?.originalPrice)
    console.log('Product price:', product.price)
    
    const effectivePrice = selectedVariant?.originalPrice && Number(selectedVariant.originalPrice) > 0
      ? selectedVariant.originalPrice
      : (selectedVariant?.price && Number(selectedVariant.price) > 0
          ? selectedVariant.price
          : product.price)
    
    console.log('Effective price chosen:', effectivePrice)
    
    const variantPayload = selectedVariant
      ? {
          _id: String(selectedVariant._id || ''),
          name: String(selectedVariant.name || ''),
          value: String(selectedVariant.value || ''),
          price: effectivePrice,
          originalPrice: selectedVariant.originalPrice,
          sku: String(selectedVariant.sku || ''),
          inventory: Number(selectedVariant.inventory || 0),
        }
      : null
    addItem(
      {
        _id: String(product._id || ''),
        name: String(product.name || ''),
        slug: String(product.slug || ''),
        description: '',
        shortDescription: '',
        price: Number(product.price || 0) as any,
        originalPrice: product.originalPrice as any,
        images: [
          {
            _id: '0' as any,
            url: imageSrc,
            alt: String(product.name || ''),
            width: 800 as any,
            height: 800 as any,
            isPrimary: true as any,
          },
        ] as any,
        category: { _id: '' as any, name: '', slug: '' } as any,
        categories: [] as any,
        tags: [] as any,
        inventory: {
          quantity: Number(product.inventory?.quantity || 0) as any,
          lowStockThreshold: 5 as any,
          sku: '' as any,
          trackInventory: true as any,
        } as any,
        seo: { title: '', description: '', keywords: [] } as any,
        variants: (product.variants || []) as any,
        reviews: [] as any,
        averageRating: Number(product.averageRating || 0) as any,
        reviewCount: Number(product.reviewCount || 0) as any,
        isActive: true as any,
        isFeatured: false as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      } as any,
      1,
      variantPayload
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
            <OptimizedImage
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              quality={85}
              priority={priority}
            />
            
            {product.badges?.topLeft && (
              <ProductBadge 
                text={product.badges.topLeft.text} 
                color={product.badges.topLeft.color} 
                position="top-left" 
              />
            )}
            {product.badges?.topRight && (
              <ProductBadge 
                text={product.badges.topRight.text} 
                color={product.badges.topRight.color} 
                position="top-right" 
              />
            )}
            {product.badges?.bottomLeft && (
              <ProductBadge 
                text={product.badges.bottomLeft.text} 
                color={product.badges.bottomLeft.color} 
                position="bottom-left" 
              />
            )}
            {product.badges?.bottomRight && (
              <ProductBadge 
                text={product.badges.bottomRight.text} 
                color={product.badges.bottomRight.color} 
                position="bottom-right" 
              />
            )}
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-center">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 flex justify-center">
          <ProductRating 
            averageRating={product.averageRating || 0}
            reviewCount={product.reviewCount || 0}
            size="sm"
          />
        </div>

        {Array.isArray(product.variants) && product.variants.length > 0 ? (
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-700 mb-2">Select Option</p>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v, idx) => {
                const isSelected = String(effectiveVariantId) === String((v as any)._id)
                const disabled = Number((v as any).inventory || 0) <= 0
                // Show sale price if available, otherwise show original price
                const priceNum = (v as any).price != null && Number((v as any).price) > 0
                  ? Number((v as any).price)
                  : ((v as any).originalPrice != null && Number((v as any).originalPrice) > 0
                      ? Number((v as any).originalPrice)
                      : (product.price != null ? Number(product.price) : NaN))
                const label = String(v.value || '').trim()
                return (
                  <button
                    key={String(v._id || idx)}
                    type="button"
                    onClick={() => setSelectedVariantId(String(v._id))}
                    disabled={disabled}
                    className={`text-xs rounded-lg border px-2 py-2 transition-colors ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{label}</span>
                      <span className="font-medium">{Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : '—'}</span>
                    </div>
                    {disabled && <span className="text-[10px] text-red-600">Out of stock</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mb-3 text-center">
            <span className="text-lg font-bold text-gray-900">
              {product.originalPrice && product.originalPrice > (product.price || 0) ? (
                <>
                  <span className="line-through text-gray-500 mr-2">${product.originalPrice.toFixed(2)}</span>
                  <span className="text-red-600">${(product.price || 0).toFixed(2)}</span>
                </>
              ) : (
                <span>${(product.price || 0).toFixed(2)}</span>
              )}
            </span>
          </div>
        )}

        <button
          onClick={onAdd}
          disabled={!canAdd}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            canAdd
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
          {canAdd ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}