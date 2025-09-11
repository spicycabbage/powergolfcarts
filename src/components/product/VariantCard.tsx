'use client'

import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useMemo, useState } from 'react'
import { normalizeImageUrl } from '@/utils/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { ProductRating } from '@/components/ProductRating'

type Variant = {
  _id?: string
  name?: string
  value?: string
  price?: number
  originalPrice?: number
  sku?: string
  inventory?: number
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
}

export default function VariantCard({ product, priority = false }: { product: CardProduct, priority?: boolean }) {
  const { addItem } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const selectedVariant = useMemo(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) return null
    return (product.variants as any[]).find(v => String(v?._id) === String(selectedVariantId)) || null
  }, [product, selectedVariantId])

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
    const variantPayload = selectedVariant
      ? {
          _id: String(selectedVariant._id || ''),
          name: String(selectedVariant.name || ''),
          value: String(selectedVariant.value || ''),
          price: selectedVariant.price,
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group product-card clickable">
      <Link href={`/products/${product.slug}`} className="block relative h-48 sm:h-56 overflow-hidden cursor-pointer">
            <OptimizedImage
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              quality={85}
              priority={priority}
            />
      </Link>
      <div className="p-4 text-center">
        <Link href={`/products/${product.slug}`} className="cursor-pointer">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Product Rating */}
        <div className="mb-2 flex justify-center">
          <ProductRating 
            averageRating={product.averageRating || 0}
            reviewCount={product.reviewCount || 0}
            size="sm"
          />
        </div>

        {Array.isArray(product.variants) && product.variants.length > 0 ? (
          <div className="mb-3">
            <div className="text-xs text-gray-700 mb-1">Select Option</div>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v, idx) => {
                const isSelected = String(selectedVariantId) === String((v as any)._id)
                const disabled = Number((v as any).inventory || 0) <= 0
                const priceNum = (v as any).price != null
                  ? Number((v as any).price)
                  : ((v as any).originalPrice != null
                      ? Number((v as any).originalPrice)
                      : (product.price != null ? Number(product.price) : NaN))
                const label = String(v.value || '').trim()
                return (
                  <button
                    key={String(v._id || idx)}
                    type="button"
                    onClick={() => setSelectedVariantId(String(v._id || String(idx)))}
                    disabled={disabled}
                    className={`text-xs rounded-lg border px-2 py-2 text-left transition-colors ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{label}</span>
                      <span className="font-medium">{Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : '—'}</span>
                    </div>
                    {disabled && <div className="text-[10px] text-red-600 mt-1">Out of stock</div>}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          // Show main product price when no variants
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${Number(product.price || 0).toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-sm text-gray-500 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onAdd}
          disabled={!canAdd}
          className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}


