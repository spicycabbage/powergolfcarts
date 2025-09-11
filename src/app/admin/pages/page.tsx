"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import BackToAdmin from '@/components/admin/BackToAdmin'
import Pagination from '@/components/admin/Pagination'

export default function AdminPagesList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/pages?page=${page}&limit=20`, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch pages')
      setItems(Array.isArray(json.data) ? json.data : [])
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [page])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return
    const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE', credentials: 'include' })
    const json = await res.json()
    if (!json.success) {
      alert(json.error || 'Failed to delete')
      return
    }
    void fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Pages</h1>
          <BackToAdmin label="Back to Admin" href="/admin" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <Link href="/admin/pages/new" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">New Page</Link>
        </div>
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {items.map((p: any) => (
                  <tr key={String(p._id)}>
                    <td className="px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3">{p.slug}</td>
                    <td className="px-4 py-3">{p.isPublished ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Link href={`/admin/pages/${p._id}`} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Edit</Link>
                      <button onClick={() => void handleDelete(p._id)} className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onChange={setPage} 
          />
        </div>
      </div>
    </div>
  )
}


