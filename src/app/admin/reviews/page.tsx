"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export default function AdminReviewsPage() {
  const [items, setItems] = useState<any[]>([])
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'|'all'>('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}&page=${page}&limit=20`, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch')
      setItems(json.data)
      setTotalPages(json.pagination.totalPages)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [status, page])

  const updateReview = async (id: string, update: any) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, ...update })
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to update')
    await fetchData()
  }

  const deleteReview = async (id: string) => {
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE', credentials: 'include' })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to delete')
    await fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Reviews Moderation</h1>
          <Link href="/admin" className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200">Back to Home</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-x-2">
            {(['pending','approved','rejected','all'] as const).map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1) }} className={`px-3 py-1 rounded-lg border ${status===s?'bg-primary-600 text-white border-primary-600':'border-gray-300'}`}>{s[0].toUpperCase()+s.slice(1)}</button>
            ))}
          </div>
          <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {items.map((r: any) => (
                  <tr key={String(r._id)}>
                    <td className="px-4 py-3"><Link href={`/products/${r.product?.slug}`} className="text-primary-600 hover:underline">{r.product?.name}</Link></td>
                    <td className="px-4 py-3">{r.user?.firstName || (r.user?.name ? String(r.user.name).split(' ')[0] : 'Anonymous')}</td>
                    <td className="px-4 py-3">{r.rating}★</td>
                    <td className="px-4 py-3">{r.title}</td>
                    <td className="px-4 py-3 max-w-md truncate" title={r.comment}>{r.comment}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => updateReview(r._id, { status: 'approved' })} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Approve</button>
                      <button onClick={() => updateReview(r._id, { status: 'rejected' })} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Reject</button>
                      <button onClick={() => deleteReview(r._id)} className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end space-x-2">
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Prev</button>
          <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}



