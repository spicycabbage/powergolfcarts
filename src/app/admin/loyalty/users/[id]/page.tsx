'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function LoyaltyUserOrdersPage() {
  const params = useParams()
  const userId = String((params as any)?.id || '')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/admin/loyalty/users/${userId}/orders?page=${page}&limit=20`, { cache: 'no-store' })
        const j = await r.json()
        if (j?.success) { setOrders(j.data || []); setTotalPages(j.pagination?.totalPages || 1) }
      } finally { setLoading(false) }
    })()
  }, [userId, page])

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-CA')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Customer Loyalty Orders</h1>
          <Link href="/admin/loyalty" className="text-sm text-blue-600 hover:text-blue-700 underline">← Back to Loyalty</Link>
        </div>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                  <th className="px-3 py-2 text-right">Discount</th>
                  <th className="px-3 py-2 text-right">Shipping</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Points Earned</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o: any) => (
                  <tr key={o._id}>
                    <td className="px-3 py-2">#{o.invoiceNumber || String(o._id).slice(-6).toUpperCase()}</td>
                    <td className="px-3 py-2">{fmt(o.createdAt)}</td>
                    <td className="px-3 py-2 text-right">${Number(o.subtotal||0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">-${Number(o?.coupon?.discount||0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">${Number(o.shipping||0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">${Number(o.total||0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{Number(o.loyaltyPoints||0)}</td>
                    <td className="px-3 py-2">{String(o.status||'').toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-600">Page {page} of {totalPages}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
                  <button className="px-3 py-1 border rounded" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


