"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import BackToAdmin from '@/components/admin/BackToAdmin'

export default function AdminBlogList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/posts?page=${page}&limit=20`, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch posts')
      setItems(Array.isArray(json.data) ? json.data : [])
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [page])

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((p: any) => String(p._id)))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev)
      if (checked) set.add(id)
      else set.delete(id)
      return Array.from(set)
    })
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Delete ${selectedIds.length} selected post(s)?`)) return
    const res = await fetch('/api/admin/posts/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: selectedIds })
    })
    const json = await res.json().catch(() => ({}))
    if (!json?.success) {
      alert(json?.error || 'Failed to delete selected posts')
      return
    }
    setSelectedIds([])
    void fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Blog Posts</h1>
          <div className="flex items-center space-x-3">
            <BackToAdmin />
            <Link href="/admin/blog/new" className="px-3 py-1 bg-primary-600 text-white rounded-lg">New Post</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Select all</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Published At</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {items.map((p: any) => (
                  <tr key={String(p._id)}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.title}`}
                        checked={selectedIds.includes(String(p._id))}
                        onChange={(e) => toggleSelectOne(String(p._id), e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/blog/${p._id}`} className="text-primary-700 hover:underline">{p.title}</Link>
                    </td>
                    <td className="px-4 py-3">{Array.isArray(p.tags) && p.tags.length ? p.tags.join(', ') : ''}</td>
                    <td className="px-4 py-3">{p.topic || ''}</td>
                    <td className="px-4 py-3">{p.isPublished ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end space-x-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}



