"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import SeoFields, { SeoData } from '@/components/seo/SeoFields'
import { Save, Package, Plus, Trash2, ChevronLeft } from 'lucide-react'
import HtmlEditor from '@/components/forms/HtmlEditor'

type Category = {
  _id: string
  name: string
  slug: string
  parent?: string | { _id: string }
  isSystem?: boolean
}

export default function NewProductPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
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

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (!name.trim()) errors.push('Name is required')
    if (!slug.trim()) errors.push('Slug is required')
    if (shortVisibleLen > 500) errors.push('Short Description exceeds 500 visible characters')
    if (longVisibleLen > 2500) errors.push('Long Description exceeds 2500 visible characters')

    const q = parseInt(quantity)
    if (isNaN(q) || q < 0) errors.push('Quantity must be 0 or greater')

    if (productType === 'simple') {
      const op = originalPrice ? parseFloat(originalPrice) : undefined
      const p = price ? parseFloat(price) : undefined
      if (op === undefined || isNaN(op) || op <= 0) errors.push('Regular Price must be greater than 0')
      if (p !== undefined && (isNaN(p) || p < 0)) errors.push('Sales Price must be 0 or greater')
      if (p !== undefined && op !== undefined && p >= op) errors.push('Sales Price must be less than Regular Price')
    }

    if (productType === 'variable') {
      if (variants.length === 0) errors.push('Add at least one variant')
      const attrName = variants[0]?.name?.trim()
      if (!attrName) errors.push('Attribute name is required')
      variants.forEach((v, idx) => {
        if (!v.value.trim()) errors.push(`Variant #${idx + 1}: Value is required`)
        const vq = parseInt(v.quantity)
        if (isNaN(vq) || vq < 0) errors.push(`Variant #${idx + 1}: Quantity must be 0 or greater`)
        const vop = v.originalPrice !== undefined && v.originalPrice !== '' ? parseFloat(v.originalPrice) : undefined
        const vp = v.price !== undefined && v.price !== '' ? parseFloat(v.price) : undefined
        if (vop == null || isNaN(vop) || vop <= 0) errors.push(`Variant #${idx + 1}: Regular Price must be greater than 0`)
        if (vp !== undefined && (isNaN(vp) || vp < 0)) errors.push(`Variant #${idx + 1}: Sales Price must be 0 or greater`)
        if (vop != null && vp != null && vp >= vop) errors.push(`Variant #${idx + 1}: Sales Price must be less than Regular Price`)
      })
    }
    return errors
  }, [name, slug, description, shortVisibleLen, longVisibleLen, quantity, productType, originalPrice, price, variants])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
      return
    }
    if (user?.role === 'admin') {
      fetchCategories()
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
    // Auto-sync slug from name until user edits slug manually
    if (!slugEdited) {
      const next = toSlug(name)
      if (name && next && next !== slug) setSlug(next)
    }

    // Initialize SEO defaults from name/description when empty
    setSeo(prev => ({
      title: prev.title || name,
      description: prev.description || (shortDescription || description).slice(0, 160),
      keywords: prev.keywords && prev.keywords.length > 0 ? prev.keywords : (name ? [name] : [])
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, shortDescription, description, slugEdited])

  // When switching to variable, ensure at least one starter variant exists
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

  const topLevelCategories = useMemo(
    () => categories.filter((c: any) => !c.parent),
    [categories]
  )

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
    // Long description optional
    if (!slug.trim()) return false
    const q = parseInt(quantity)
    if (isNaN(q) || q < 0) return false

    if (productType === 'simple') {
      if (op === undefined || isNaN(op) || op <= 0) return false
      if (p !== undefined && (isNaN(p) || p < 0)) return false
      if (p !== undefined && op !== undefined && p >= op) return false
    }

    if (productType === 'variable') {
      if (variants.length === 0) return false
      for (const v of variants) {
        if (!v.name.trim() || !v.value.trim()) return false
        const vq = parseInt(v.quantity)
        if (isNaN(vq) || vq < 0) return false
        const vop = v.originalPrice !== undefined && v.originalPrice !== '' ? parseFloat(v.originalPrice) : undefined
        const vp = v.price !== undefined && v.price !== '' ? parseFloat(v.price) : undefined
        if ((vop == null || isNaN(vop) || vop <= 0) && (vp == null || isNaN(vp) || vp < 0)) return false
        if (vop != null && vp != null && vp >= vop) return false
      }
    }
    if (shortVisibleLen > 500) return false
    if (longVisibleLen > 2000) return false
    return true
  }, [name, description, longVisibleLen, shortVisibleLen, price, originalPrice, quantity, slug, productType, variants])

  const removeImageField = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const handleImageFile = async (file: File) => {
    console.log('handleImageFile called with:', file)
    if (!file) {
      console.log('No file provided')
      return
    }
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      alert('Please select an image file')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      console.log('File too large:', file.size)
      alert('Image must be less than 4MB')
      return
    }
    
    console.log('Starting upload for:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    const form = new FormData()
    form.append('file', file)
    
    try {
      const res = await fetch('/api/admin/products/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      
      console.log('Upload response status:', res.status)
      
      if (!res.ok) {
        const text = await res.text()
        console.error('Upload failed with response:', text)
        alert(`Upload failed: ${text || 'Unknown error'}`)
        return
      }
      
      const data = await res.json()
      console.log('Upload successful, received data:', data)
      setImages(prev => [...prev, data.url as string])
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload error: ${error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      // Check if this is a flower product to add "strain" to alt tags
      const isFlowerProduct = categories.some(cat => 
        ['flowers', 'indica', 'sativa', 'hybrid'].includes(cat.name?.toLowerCase())
      )
      
      const altText = isFlowerProduct && !name.toLowerCase().includes('strain') 
        ? `${name} strain` 
        : name
      
      const imageObjects = images
        .map(u => u.trim())
        .filter(Boolean)
        .map((url, idx) => ({ url, alt: altText, width: 800, height: 800, isPrimary: idx === 0 }))

      const primaryCategoryId = extraCategoryIds[0] || (uncategorized ? (uncategorized as any)._id : undefined)

      const payload: any = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        productType,
        price: price ? parseFloat(price) : undefined, // Sales Price (optional)
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined, // Regular Price
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
          name: v.name.trim(),
          value: v.value.trim(),
          originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : undefined,
          price: v.price ? parseFloat(v.price) : undefined,
          sku: v.sku?.trim() || undefined,
          inventory: parseInt(v.quantity) || 0
        }))
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        alert(text || 'Failed to create product')
        return
      }

      alert('Product created')
      router.push('/admin')
    } catch (err) {
      alert('Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loadingCats) {
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
              <h1 className="text-xl font-semibold text-gray-900">Create Product</h1>
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
                {saving ? 'Saving…' : 'Save Product'}
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
              <span className="text-gray-900 font-medium">New</span>
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
                  <HtmlEditor label="Long Description" value={description} onChange={setDescription} rows={24} placeholder="Write detailed description (HTML supported)" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sales Price</label>
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
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                    const files = Array.from(e.target.files || [])
                    files.forEach(f => void handleImageFile(f))
                  }} />
                  <Plus className="w-4 h-4 mr-2" /> Upload Images
                </label>
              </div>
              {images.length === 0 ? (
                <p className="text-sm text-gray-500">No images uploaded yet. Upload a primary image.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((url, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="text-xs text-gray-600 mb-2 font-medium">{idx === 0 ? 'Primary Image' : `Image ${idx + 1}`}</div>
                      {/* Preview (preserve original aspect ratio) */}
                      <div className="w-full overflow-hidden rounded bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Product image ${idx + 1}`} className="w-full h-auto" />
                      </div>
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
                {uncategorized && (
                  <p className="text-xs text-gray-500 mt-2">If none selected, product will default to: {(uncategorized as any).name}</p>
                )}
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
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </form>
      {!canSave && validationErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium mb-2">Cannot save. Fix the following:</p>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.slice(0, 8).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}


