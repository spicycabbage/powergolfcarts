"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import SeoFields, { SeoData } from '@/components/seo/SeoFields'
import { Save, Package, Plus, Trash2 } from 'lucide-react'

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
  const [price, setPrice] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState<string>('0')
  const [trackInventory, setTrackInventory] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [seo, setSeo] = useState<SeoData>({ title: '', description: '', keywords: [] })

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
      const res = await fetch('/api/admin/categories')
      if (!res.ok) return
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } finally {
      setLoadingCats(false)
    }
  }

  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
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
    const p = parseFloat(price)
    const op = originalPrice ? parseFloat(originalPrice) : undefined
    if (!name.trim()) return false
    if (!description.trim()) return false
    if (isNaN(p) || p <= 0) return false
    if (!slug.trim()) return false
    if (op !== undefined && (isNaN(op) || op < 0)) return false
    const q = parseInt(quantity)
    if (isNaN(q) || q < 0) return false
    return true
  }, [name, description, price, originalPrice, quantity, slug])

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

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
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
        variants: [],
        isActive,
        isFeatured,
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
      router.push('/products')
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
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Admin
              </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Long Description *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={24} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                  <input inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                  <input inputMode="decimal" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0.00" />
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
    </div>
  )
}


