"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import SeoFields, { SeoData } from '@/components/seo/SeoFields'
import { Save, Package, Plus, Trash2, ChevronLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
const HtmlEditor = dynamic(() => import('@/components/forms/HtmlEditor'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded animate-pulse" />
})

type Category = {
  _id: string
  name: string
  slug: string
  parent?: string | { _id: string }
  isSystem?: boolean
}

export default function EditProductPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = (params?.id as string) || ''

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [price, setPrice] = useState<string>('') // Sales Price (optional)
  const [originalPrice, setOriginalPrice] = useState<string>('') // Regular Price (required)
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState<string>('0')
  const [trackInventory, setTrackInventory] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [seo, setSeo] = useState<SeoData>({ title: '', description: '', keywords: [] })
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple')
  const [variants, setVariants] = useState<Array<{ name: string; value: string; originalPrice?: string; price?: string; sku?: string; quantity: string }>>([])

  // Badge states
  const [badgeTL, setBadgeTL] = useState({ text: '', color: 'red' as const })
  const [badgeTR, setBadgeTR] = useState({ text: '', color: 'red' as const })
  const [badgeBL, setBadgeBL] = useState({ text: '', color: 'red' as const })
  const [badgeBR, setBadgeBR] = useState({ text: '', color: 'red' as const })

  const visibleTextLength = (html: string): number => {
    if (!html) return 0
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#\d+;|&[a-z]+;/gi, ' ')
    return text.replace(/\s+/g, ' ').trim().length
  }
  const shortVisibleLen = useMemo(() => visibleTextLength(shortDescription), [shortDescription])
  const longVisibleLen = useMemo(() => visibleTextLength(description), [description])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
      return
    }
    if (user?.role === 'admin') {
      fetchCategories()
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, isLoading])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?activeOnly=true&limit=1000', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json().catch(() => ({} as any))
      // Handle different API response structures
      const cats = Array.isArray(json?.data) ? json.data : 
                   Array.isArray(json?.categories) ? json.categories : 
                   (Array.isArray(json) ? json : [])
      setCategories(cats)
    } finally {
      setLoadingCats(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json().catch(() => ({} as any))
      const p = json?.data || json
      if (!p) return
      setName(p.name || '')
      setSlug(p.slug || '')
      setDescription(p.description || '')
      setShortDescription(p.shortDescription || '')
      // Treat legacy imports: if originalPrice is missing, consider price as Regular and no Sale
      const regular = p.originalPrice != null ? p.originalPrice : p.price
      const sale = p.originalPrice != null && p.price != null && p.price < p.originalPrice ? p.price : undefined
      setOriginalPrice(regular != null ? String(regular) : '')
      setPrice(sale != null ? String(sale) : '')
      const imgUrls = Array.isArray(p.images) ? p.images.map((i: any) => (typeof i === 'string' ? i : i.url)).filter(Boolean) : []
      setImages(imgUrls)
      const allCats = [p.category?._id, ...(Array.isArray(p.categories) ? p.categories.map((c: any) => c?._id || c) : [])].filter(Boolean)
      setExtraCategoryIds(Array.from(new Set(allCats)))
      setTagsInput(Array.isArray(p.tags) ? p.tags.join(', ') : '')
      setSku(p.inventory?.sku || '')
      setQuantity(String(p.inventory?.quantity ?? '0'))
      setTrackInventory(p.inventory?.trackInventory ?? true)
      setIsActive(p.isActive ?? true)
      setIsFeatured(p.isFeatured ?? false)
      if (Array.isArray(p.variants)) {
        const mapped = p.variants.map((v: any) => ({
          name: v.name || 'Option',
          value: v.value || '',
          originalPrice: v.originalPrice != null ? String(v.originalPrice) : '',
          price: v.price != null ? String(v.price) : '',
          sku: v.sku || '',
          quantity: v.inventory != null ? String(v.inventory) : '0'
        }))
        setVariants(mapped)
      }
      const derivedType: 'simple' | 'variable' = (p.productType as any) || (Array.isArray(p.variants) && p.variants.length > 0 ? 'variable' : 'simple')
      setProductType(derivedType)
      setSeo({
        title: p.seo?.title || '',
        description: p.seo?.description || '',
        keywords: Array.isArray(p.seo?.keywords) ? p.seo.keywords : []
      })
      
      // Initialize badges
      if (p.badges) {
        setBadgeTL({
          text: p.badges.topLeft?.text || '',
          color: p.badges.topLeft?.color || 'red'
        })
        setBadgeTR({
          text: p.badges.topRight?.text || '',
          color: p.badges.topRight?.color || 'red'
        })
        setBadgeBL({
          text: p.badges.bottomLeft?.text || '',
          color: p.badges.bottomLeft?.color || 'red'
        })
        setBadgeBR({
          text: p.badges.bottomRight?.text || '',
          color: p.badges.bottomRight?.color || 'red'
        })
      }
    } finally {
      setLoadingProduct(false)
    }
  }

  const toSlug = (s: string) =>
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

  useEffect(() => {
    if (!slugEdited) {
      const next = toSlug(name)
      if (name && next && next !== slug) setSlug(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slugEdited])

  // When switching to variable, ensure at least one starter variant exists (for legacy simple products)
  useEffect(() => {
    if (productType === 'variable' && variants.length === 0) {
      const reg = originalPrice ? parseFloat(originalPrice) : (price ? parseFloat(price) : undefined)
      const sale = price ? parseFloat(price) : undefined
      const qty = parseInt(quantity) || 0
      setVariants([{
        name: variants[0]?.name || 'Option',
        value: 'Default',
        originalPrice: reg != null && !Number.isNaN(reg) ? String(reg) : '',
        price: sale != null && !Number.isNaN(sale) ? String(sale) : '',
        sku: '',
        quantity: String(qty)
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

  const nonSystemCategories = useMemo(
    () => categories.filter((c: any) => !c.isSystem),
    [categories]
  )

  const byParent = useMemo(() => {
    const map: Record<string, Category[]> = {}
    for (const c of nonSystemCategories) {
      const parentId = typeof c.parent === 'string' ? c.parent : (c.parent && (c.parent as any)._id) || ''
      map[parentId] = map[parentId] || []
      map[parentId].push(c)
    }
    return map
  }, [nonSystemCategories])

  const toggleExtraCategory = (id: string) => {
    setExtraCategoryIds(prev => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ))
  }

  const uncategorized = useMemo(() => categories.find(c => c.slug === 'uncategorized' || c.isSystem), [categories])

  const canSave = useMemo(() => {
    const op = originalPrice ? parseFloat(originalPrice) : undefined
    const p = price ? parseFloat(price) : undefined
    if (!name.trim()) return false
    if (!description || longVisibleLen === 0) return false
    if (!slug.trim()) return false
    const q = parseInt(quantity)
    if (isNaN(q) || q < 0) return false

    if (productType === 'simple') {
      const hasRegular = op !== undefined && !isNaN(op) && op > 0
      const hasSale = p !== undefined && !isNaN(p) && p >= 0
      if (!hasRegular && !hasSale) return false
      if (hasRegular && hasSale && p! >= op!) return false
    }

    if (productType === 'variable') {
      if (variants.length === 0) return false
      for (const v of variants) {
        // Only require value and non-negative quantity; pricing is optional on edit
        if (!v.value.trim()) return false
        const vq = parseInt(v.quantity)
        if (isNaN(vq) || vq < 0) return false
        const vop = v.originalPrice !== undefined && v.originalPrice !== '' ? parseFloat(v.originalPrice) : undefined
        const vp = v.price !== undefined && v.price !== '' ? parseFloat(v.price) : undefined
        if (vop != null && vp != null && vp >= vop) return false
      }
    }
    if (shortVisibleLen > 500) return false
    if (longVisibleLen > 2500) return false
    return true
  }, [name, description, longVisibleLen, shortVisibleLen, price, originalPrice, quantity, slug, productType, variants])

  const removeImageField = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const handleImageFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Image must be less than 4MB')
      return
    }
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/products/upload', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
    if (!res.ok) {
      const text = await res.text()
      alert(text || 'Upload failed')
      return
    }
    const data = await res.json()
    setImages(prev => [...prev, data.url as string])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const imageObjects = images
        .map(u => u.trim())
        .filter(Boolean)
        .map((url, idx) => ({ url, alt: name, width: 800, height: 800, isPrimary: idx === 0 }))

      const primaryCategoryId = extraCategoryIds[0] || (uncategorized ? (uncategorized as any)._id : undefined)

      // Normalize pricing: if only Sales provided, treat it as Regular
      let op = originalPrice ? parseFloat(originalPrice) : undefined
      let sp = price ? parseFloat(price) : undefined
      if ((op == null || isNaN(op)) && sp != null && !isNaN(sp)) {
        op = sp
        sp = undefined
      }

      const payload: any = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        productType,
        price: sp,
        originalPrice: op,
        images: imageObjects,
        category: primaryCategoryId,
        categories: extraCategoryIds.filter(id => id !== primaryCategoryId),
        tags: tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        inventory: {
          quantity: parseInt(quantity) || 0,
          lowStockThreshold: 5,
          trackInventory,
          ...(sku.trim() ? { sku: sku.trim() } : {}),
        },
        seo: {
          title: seo.title?.trim() || name.trim(),
          description: seo.description?.trim() || shortDescription.trim() || description.trim(),
          keywords: Array.isArray(seo.keywords) ? seo.keywords.filter(Boolean) : [],
        },
        ...(badgeTL.text.trim() || badgeTR.text.trim() || badgeBL.text.trim() || badgeBR.text.trim() ? {
          badges: {
            ...(badgeTL.text.trim() ? { topLeft: { text: badgeTL.text.trim(), color: badgeTL.color } } : {}),
            ...(badgeTR.text.trim() ? { topRight: { text: badgeTR.text.trim(), color: badgeTR.color } } : {}),
            ...(badgeBL.text.trim() ? { bottomLeft: { text: badgeBL.text.trim(), color: badgeBL.color } } : {}),
            ...(badgeBR.text.trim() ? { bottomRight: { text: badgeBR.text.trim(), color: badgeBR.color } } : {}),
          }
        } : {}),
        variants: [],
        isActive,
        isFeatured,
      }

      if (productType === 'variable') {
        payload.variants = variants.map(v => ({
          name: (v.name?.trim() || variants[0]?.name?.trim() || 'Option'),
          value: v.value.trim(),
          originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : undefined,
          price: v.price ? parseFloat(v.price) : undefined,
          sku: v.sku?.trim() || undefined,
          inventory: parseInt(v.quantity) || 0
        }))
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to update product')
        return
      }

      alert('Product updated')
    } catch (err) {
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loadingCats || loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/admin/inventory" className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Inventory
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!canSave || saving}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
          {/* Admin breadcrumb */}
          <div className="pb-3">
            <nav className="text-sm text-gray-600 flex items-center space-x-2">
              <Link href="/admin" className="hover:text-primary-600">Admin</Link>
              <span>/</span>
              <span className="hover:text-primary-600">Products</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit</span>
            </nav>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Product Type */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Product Type</h2>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center space-x-2">
                  <input type="radio" name="ptype" checked={productType==='simple'} onChange={() => setProductType('simple')} className="text-primary-600" />
                  <span className="text-sm text-gray-700">Simple</span>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input type="radio" name="ptype" checked={productType==='variable'} onChange={() => setProductType('variable')} className="text-primary-600" />
                  <span className="text-sm text-gray-700">Variable</span>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input
                    value={slug}
                    onChange={e => { setSlug(e.target.value); if (!slugEdited) setSlugEdited(true) }}
                    onBlur={e => setSlug(toSlug(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <HtmlEditor label="Short Description" value={shortDescription} onChange={setShortDescription} rows={8} placeholder="Write a short summary (HTML supported)" />
                  <div className={`mt-1 text-xs text-right ${shortVisibleLen > 500 ? 'text-red-600' : 'text-gray-500'}`}>{shortVisibleLen}/500 visible chars</div>
                </div>
                <div>
                  <HtmlEditor label="Long Description" value={description} onChange={setDescription} rows={24} required placeholder="Write detailed description (HTML supported)" />
                  <div className={`mt-1 text-xs text-right ${longVisibleLen > 2500 ? 'text-red-600' : 'text-gray-500'}`}>{longVisibleLen}/2500 visible chars</div>
                </div>
              </div>
            </div>

            {/* Variants (Variable products) */}
            {productType === 'variable' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Variants</h2>
                  <button type="button" onClick={() => setVariants(v => [...v, { name: variants[0]?.name || '', value: '', originalPrice: '', price: '', sku: '', quantity: '0' }])} className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Add Variant</button>
                </div>
                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Attribute</label>
                        <input value={variants[0]?.name || ''} onChange={e => setVariants(arr => arr.map((x)=> ({ ...x, name: e.target.value })))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Size" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Value</label>
                        <input value={v.value} onChange={e => setVariants(arr => arr.map((x,i)=> i===idx? { ...x, value: e.target.value }: x))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. 1g" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Reg Price</label>
                        <input value={v.originalPrice || ''} onChange={e => setVariants(arr => arr.map((x,i)=> i===idx? { ...x, originalPrice: e.target.value }: x))} inputMode="decimal" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sales Price</label>
                        <input value={v.price || ''} onChange={e => setVariants(arr => arr.map((x,i)=> i===idx? { ...x, price: e.target.value }: x))} inputMode="decimal" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">SKU</label>
                        <input value={v.sku || ''} onChange={e => setVariants(arr => arr.map((x,i)=> i===idx? { ...x, sku: e.target.value }: x))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                        <input value={v.quantity} onChange={e => setVariants(arr => arr.map((x,i)=> i===idx? { ...x, quantity: e.target.value }: x))} inputMode="numeric" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      </div>
                      <div className="text-right">
                        <button type="button" onClick={() => setVariants(arr => arr.filter((_,i)=> i!==idx))} className="px-3 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Inventory (Simple products only) */}
            {productType === 'simple' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price *</label>
                  <input inputMode="decimal" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text sm font-medium text-gray-700 mb-2">Sales Price</label>
                  <input inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU (optional)</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div className="flex items-center space-x-3 pt-7">
                  <input id="trackInv" type="checkbox" checked={trackInventory} onChange={e => setTrackInventory(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="trackInv" className="text-sm text-gray-700">Track Inventory</label>
                </div>
              </div>
            </div>
            )}

            {/* Product Badges */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Product Badges</h2>
              <p className="text-sm text-gray-600">Add optional badges to display on product cards. Each badge can be positioned in a different corner.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Left Badge */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">TL (Top Left)</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Badge text (optional)"
                      value={badgeTL.text}
                      onChange={e => setBadgeTL(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select
                      value={badgeTL.color}
                      onChange={e => setBadgeTL(prev => ({ ...prev, color: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="gray">Gray</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                {/* Top Right Badge */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">TR (Top Right)</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Badge text (optional)"
                      value={badgeTR.text}
                      onChange={e => setBadgeTR(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select
                      value={badgeTR.color}
                      onChange={e => setBadgeTR(prev => ({ ...prev, color: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="gray">Gray</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Left Badge */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">BL (Bottom Left)</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Badge text (optional)"
                      value={badgeBL.text}
                      onChange={e => setBadgeBL(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select
                      value={badgeBL.color}
                      onChange={e => setBadgeBL(prev => ({ ...prev, color: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="gray">Gray</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Right Badge */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">BR (Bottom Right)</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Badge text (optional)"
                      value={badgeBR.text}
                      onChange={e => setBadgeBR(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select
                      value={badgeBR.color}
                      onChange={e => setBadgeBR(prev => ({ ...prev, color: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="gray">Gray</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">SEO</h2>
              <SeoFields seo={seo} onChange={setSeo} keyphraseLabel="Focus Keyphrase" />
            </div>
          </div>

          {/* Right column (sidebar) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Visibility */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Visibility</h2>
              <label className="flex items-center space-x-3">
                <input id="isActive" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <span className="text-sm text-gray-700">Visible</span>
              </label>
              <label className="flex items-center space-x-3">
                <input id="isFeatured" type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Images</h2>
                <label className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) void handleImageFile(f)
                  }} />
                  <Plus className="w-4 h-4 mr-2" /> Upload Image
                </label>
              </div>
              {images.length === 0 ? (
                <p className="text-sm text-gray-500">No images yet. Upload a primary image.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((url, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="text-xs text-gray-600 mb-2 font-medium">{idx === 0 ? 'Primary Image' : `Image ${idx + 1}`}</div>
                      {/* Preview */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Product image ${idx + 1}`} className="w-full h-auto" />
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-gray-500 truncate">{url}</div>
                        <button type="button" onClick={() => removeImageField(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Categories</h2>
              {loadingCats ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : (
                <div className="space-y-1">
                {(byParent[''] || []).map(top => (
                  <div key={top._id} className="">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={extraCategoryIds.includes(top._id)}
                        onChange={() => toggleExtraCategory(top._id)}
                      />
                      <span className={`text-sm text-gray-700`}>{top.name}</span>
                    </label>
                    {(byParent[top._id] || []).map(child => (
                      <div key={child._id} className="pl-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={extraCategoryIds.includes(child._id)}
                            onChange={() => toggleExtraCategory(child._id)}
                          />
                          <span className={`text-sm text-gray-700`}>{child.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="e.g. indica, gassy, kush" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-8">
          <button type="submit" disabled={!canSave || saving} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}


