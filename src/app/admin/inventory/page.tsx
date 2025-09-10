'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import BackToAdmin from '@/components/admin/BackToAdmin'

export default function AdminInventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name'|'isFeatured'|'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc')
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showHidden, setShowHidden] = useState(false)

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(h)
  }, [searchTerm])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (session?.user?.role !== 'admin') {
      router.push('/account')
      return
    }
    setIsChecking(false)
  }, [session, status, router])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const fields = [
          '_id','name','price','originalPrice','images','inventory','isFeatured','createdAt','category','categories','variants','isActive'
        ].join(',')
        const url = `/api/products?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}&fields=${encodeURIComponent(fields)}&populate=false${showHidden ? '&includeInactive=true' : ''}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json().catch(() => ({} as any))
        if (mounted) {
          setRecentProducts(Array.isArray(json?.data) ? json.data : [])
          const pag = json?.pagination || {}
          setTotalPages(pag.totalPages || 1)
          setTotal(pag.total || 0)
        }
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    })()
    return () => { mounted = false }
  }, [page, sortBy, sortOrder, selectedCategory, debouncedSearch, showHidden])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/categories?activeOnly=true&limit=1000', { cache: 'no-store' })
        const json = await res.json().catch(() => ({} as any))
        if (mounted) setCategories(Array.isArray(json?.categories) ? json.categories : [])
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  // Fast lookup from category id -> name using loaded categories
  const categoryNameById = (id: any): string | undefined => {
    if (!id) return undefined
    const stringId = typeof id === 'string' ? id : (id?._id || '')
    const found = categories.find((c: any) => String(c._id) === String(stringId))
    return found?.name
  }

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
            <BackToAdmin label="Back to Admin" href="/admin" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-12 relative" style={{ zIndex: 100 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 relative z-50">
              <label className="text-sm text-gray-700">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white relative z-50"
                  style={{ position: 'relative', zIndex: 9999 }}
                >
                  <option value="">All</option>
                  {categories.map((c: any) => (
                    <option key={String(c._id)} value={String(c._id)}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                placeholder="Name, description..."
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setPage(1) }}
                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
            <label className="inline-flex items-center gap-2 ml-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => { setShowHidden(e.target.checked); setPage(1) }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Show hidden
            </label>
          </div>
          <button
            disabled={selectedIds.length === 0}
            onClick={async () => {
              if (selectedIds.length === 0) return
              if (!confirm(`Delete ${selectedIds.length} selected item(s)?`)) return
              try {
                for (const id of selectedIds) {
                  await fetch(`/api/products/${id}`, { method: 'DELETE' })
                }
                setSelectedIds([])
                setLoadingProducts(true)
                const url = `/api/products?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}&fields=_id,name,price,images,inventory,isFeatured,createdAt,category,isActive&populate=false${showHidden ? '&includeInactive=true' : ''}`
                const res = await fetch(url, { cache: 'no-store' })
                const json = await res.json().catch(() => ({} as any))
                setRecentProducts(Array.isArray(json?.data) ? json.data : [])
                const pag = json?.pagination || {}
                setTotalPages(pag.totalPages || 1)
                setTotal(pag.total || 0)
              } catch {}
              finally {
                setLoadingProducts(false)
              }
            }}
            className={`px-4 py-2 rounded-lg border ${selectedIds.length === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50'}`}
          >
            Delete
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative z-10">
          {loadingProducts ? (
            <div className="p-6 text-gray-600">Loading…</div>
          ) : recentProducts.length === 0 ? (
            <div className="p-6 text-gray-600">No products yet.</div>
          ) : (
            <>
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages} • {total} total
                </div>
                <div className="inline-flex items-center space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={`px-3 py-2 text-sm rounded-lg border ${page <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Prev
                  </button>
                  <div className="hidden sm:flex items-center space-x-1">
                    {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 text-sm rounded-lg border ${page === i + 1 ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={`px-3 py-2 text-sm rounded-lg border ${page >= totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto" style={{ zIndex: 1 }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedIds.length > 0 && selectedIds.length === recentProducts.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(recentProducts.map((p: any) => p._id))
                            else setSelectedIds([])
                          }}
                        />
                      </th>
                      <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => { setSortBy('name'); setSortOrder(prev => sortBy==='name' && prev==='asc' ? 'desc' : 'asc') }} className="flex items-center space-x-1 hover:text-primary-600">
                          <span>Name</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '30%' }}>Variant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '1%' }}>
                        <button onClick={() => { setSortBy('isFeatured'); setSortOrder(prev => sortBy==='isFeatured' && prev==='asc' ? 'desc' : 'asc') }} className="flex items-center space-x-1 hover:text-primary-600">
                          <span>FEAT</span>
                        </button>
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '1%' }}>VIS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => { setSortBy('createdAt'); setSortOrder(prev => sortBy==='createdAt' && prev==='asc' ? 'desc' : 'asc') }} className="flex items-center space-x-1 hover:text-primary-600">
                          <span>Date Published</span>
                        </button>
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProducts.map((p: any) => (
                      <tr key={p._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedIds.includes(p._id)}
                            onChange={(e) => {
                              setSelectedIds(prev => e.target.checked ? [...prev, p._id] : prev.filter(id => id !== p._id))
                            }}
                          />
                        </td>
                        <td className="px-1 py-4 whitespace-nowrap text-sm">
                          {Array.isArray(p.images) && p.images.length > 0 ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100">
                              <Image
                                src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0]?.url || '/placeholder-product.jpg')}
                                alt={typeof p.images[0] === 'string' ? p.name : (p.images[0]?.alt || p.name)}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Link href={`/admin/products/${p._id}`} className="text-primary-600 hover:text-primary-700">{p.name}</Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{Array.isArray(p.variants) && p.variants.length > 0 ? (
                          <div className="pr-1 space-y-1">
                            {p.variants.map((v: any, vi: number) => (
                              <div key={vi} className="flex items-center justify-between">
                                <div className="text-gray-700">
                                  <span className="font-medium">{v.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{Array.isArray(p.variants) && p.variants.length > 0 ? (
                          <div className="pr-1 space-y-1">
                            {p.variants.map((v: any, vi: number) => (
                              <div key={vi}>
                                {v.price != null ? (
                                  <>
                                    <span className="text-gray-900">${Number(v.price).toFixed(2)}</span>
                                    {v.originalPrice != null && (
                                      <span className="line-through text-gray-400 ml-1">${Number(v.originalPrice).toFixed(2)}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-900">${Number(v.originalPrice || 0).toFixed(2)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          `$${Number(p.price || 0).toFixed(2)}`
                        )}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{Array.isArray(p.variants) && p.variants.length > 0 ? (
                          <div className="pr-1 space-y-1">
                            {p.variants.map((v: any, vi: number) => (
                              <div key={vi}>{v.inventory ?? 0}</div>
                            ))}
                          </div>
                        ) : (
                          p?.inventory?.quantity ?? 0
                        )}</td>
                        <td className="px-6 py-4 text-sm">{Array.isArray(p.variants) && p.variants.length > 0 ? (
                          <div className="pr-1 space-y-1">
                            {p.variants.map((v: any, vi: number) => (
                              <div key={vi}>
                                <button
                                  onClick={async () => {
                                    const current = Number(v.inventory ?? 0)
                                    const input = prompt(`Enter new stock for ${v.value}`, String(current))
                                    if (input === null) return
                                    const qty = parseInt(input)
                                    if (isNaN(qty) || qty < 0) { alert('Invalid quantity'); return }
                                    const newVariants = (p.variants || []).map((vv: any, idx: number) => idx === vi ? { ...vv, inventory: qty } : vv)
                                    const res = await fetch(`/api/products/${p._id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ variants: newVariants })
                                    })
                                    if (!res.ok) { alert('Failed to update variant stock'); return }
                                    setRecentProducts(prev => prev.map(x => x._id === p._id ? { ...x, variants: newVariants } : x))
                                  }}
                                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-50"
                                >
                                  Update
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              const current = Number(p?.inventory?.quantity ?? 0)
                              const input = prompt('Enter new stock quantity', String(current))
                              if (input === null) return
                              const qty = parseInt(input)
                              if (isNaN(qty) || qty < 0) { alert('Invalid quantity'); return }
                              const res = await fetch(`/api/products/${p._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ inventory: { ...(p.inventory || {}), quantity: qty } })
                              })
                              if (!res.ok) { alert('Failed to update stock'); return }
                              setRecentProducts(prev => prev.map(x => x._id === p._id ? { ...x, inventory: { ...(x.inventory || {}), quantity: qty } } : x))
                            }}
                            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                          >
                            Update
                          </button>
                        )}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {(() => {
                            const names: string[] = []
                            const primaryId = typeof p?.category === 'string' ? p.category : (p?.category?._id)
                            const primaryName = categoryNameById(primaryId)
                            if (primaryName) names.push(primaryName)
                            if (Array.isArray(p?.categories)) {
                              for (const c of p.categories) {
                                const nm = categoryNameById(c)
                                if (nm) names.push(nm)
                              }
                            }
                            const seen = new Set<string>()
                            const unique = names.filter(n => {
                              const key = String(n).toLowerCase().trim()
                              if (seen.has(key)) return false
                              seen.add(key)
                              return true
                            })
                            return unique.join(', ')
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {p.isFeatured ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-50 text-yellow-700">Yes</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p?.isActive === false ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">No</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700">Yes</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages} • {total} total
                </div>
                <div className="inline-flex items-center space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={`px-3 py-2 text-sm rounded-lg border ${page <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Prev
                  </button>
                  <div className="hidden sm:flex items-center space-x-1">
                    {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 text-sm rounded-lg border ${page === i + 1 ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={`px-3 py-2 text-sm rounded-lg border ${page >= totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


