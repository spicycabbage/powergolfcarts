'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDateMMMDDYYYY } from '@/utils/dates'
import BackToAdmin from '@/components/admin/BackToAdmin'
import Pagination from '@/components/admin/Pagination'

export default function AdminOrdersList() {
  const [orders, setOrders] = useState<any[]>([])
  const [trackingFilter, setTrackingFilter] = useState<'all'|'with'|'without'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [trackCarrier, setTrackCarrier] = useState('')
  const [trackNumber, setTrackNumber] = useState('')
  const [savingTrack, setSavingTrack] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&limit=20`, { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch orders')
      const data = Array.isArray(json.data) ? json.data : []
      setOrders(data)
      setTotalPages(json.pagination?.totalPages || 1)
      setTotal(json.pagination?.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchOrders() }, [page])

  const buildTrackingUrl = (carrier?: string, num?: string) => {
    if (!carrier || !num) return ''
    const lc = carrier.toLowerCase()
    if (lc === 'canadapost' || lc === 'canada post' || lc === 'canada-post') {
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(num)}`
    }
    if (lc === 'purolator') {
      return `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(num)}`
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <BackToAdmin label="Back to Home" href="/admin" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Total Orders: {total}</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Shipment Tracking:</label>
            <select value={trackingFilter} onChange={e=>setTrackingFilter(e.target.value as any)} className="px-2 py-1 border rounded">
              <option value="all">All</option>
              <option value="with">With</option>
              <option value="without">Without</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-lg border">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg border text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedIds.length > 0 && selectedIds.length === orders.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? orders.map((o: any) => String(o._id)) : [])}
                    />
                  </th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Shipment Tracking</th>
                  <th className="px-4 py-3">Total</th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {orders
                  .filter((o: any) => trackingFilter === 'all' ? true : (trackingFilter === 'with' ? Boolean(o.trackingNumber || (Array.isArray(o.tracking) && o.tracking.length > 0)) : !Boolean(o.trackingNumber || (Array.isArray(o.tracking) && o.tracking.length > 0))))
                  .map((o: any) => (
                  <tr key={o._id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedIds.includes(String(o._id))}
                        onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, String(o._id)] : prev.filter(id => id !== String(o._id)))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o._id}`} className="text-primary-600 hover:text-primary-700">
                        {o.invoiceNumber ?? (o.orderNumber || o._id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatDateMMMDDYYYY(o.createdAt)}</td>
                    <td className="px-4 py-3">{o.status}</td>
                    <td className="px-4 py-3">{o.shippingAddress ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}` : ''}</td>
                    <td className="px-4 py-3">{o.itemCount ?? 0}</td>
                    <td className="px-4 py-3">
                      {editingId === String(o._id) ? (
                        <div className="flex items-center gap-2">
                          <select value={trackCarrier} onChange={e=>setTrackCarrier(e.target.value)} className="px-2 py-1 border rounded bg-white">
                            <option value="">Carrier</option>
                            <option value="canadapost">Canada Post</option>
                            <option value="purolator">Purolator</option>
                          </select>
                          <input value={trackNumber} onChange={e=>setTrackNumber(e.target.value)} placeholder="Tracking number" className="px-2 py-1 border rounded w-40" />
                          <button
                            onClick={async()=>{ try { setSavingTrack(true); const res = await fetch(`/api/admin/orders/${o._id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ addTracking: { carrier: trackCarrier, number: trackNumber } }) }); const j = await res.json(); if (!j.success) throw new Error(j.error||'Save failed'); setOrders(prev => prev.map(ord => ord._id === o._id ? { ...ord, tracking: j.data?.tracking || ord.tracking, trackingCarrier: trackCarrier, trackingNumber: trackNumber } : ord)); setEditingId(null); } catch(e:any){ alert(e?.message||'Failed to save') } finally { setSavingTrack(false) } }}
                            className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                            disabled={savingTrack || !trackCarrier || !trackNumber}
                          >Save</button>
                          <button onClick={()=>{ setEditingId(null); setTrackCarrier(''); setTrackNumber(''); }} className="px-2 py-1 bg-gray-200 rounded">Cancel</button>
                        </div>
                      ) : (
                        (()=>{
                          const t = (Array.isArray(o.tracking) && o.tracking.length > 0) ? o.tracking[0] : (o.trackingCarrier && o.trackingNumber ? { carrier: o.trackingCarrier, number: o.trackingNumber } : null)
                          if (t) {
                            const url = buildTrackingUrl(t.carrier, t.number)
                            const carrierLabel = (String(t.carrier||'').toLowerCase()==='canadapost' ? 'Canada Post' : (String(t.carrier||'').toLowerCase()==='purolator' ? 'Purolator' : String(t.carrier||'')))
                            return (
                              <div className="flex items-center gap-2">
                                <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                  {carrierLabel} {t.number}
                                </a>
                                {((Array.isArray(o.tracking) && o.tracking.length > 1)) ? (
                                  <span className="text-xs text-gray-500">(+{o.tracking.length - 1})</span>
                                ) : null}
                              </div>
                            )
                          }
                          return null
                        })()
                      )}
                    </td>
                    <td className="px-4 py-3">${Number(o.total||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
              <button
                disabled={selectedIds.length === 0}
                onClick={async () => {
                  if (selectedIds.length === 0) return
                  if (!confirm(`Delete ${selectedIds.length} selected order(s)?`)) return
                  try {
                    for (const id of selectedIds) {
                      await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
                    }
                    setSelectedIds([])
                    void fetchOrders()
                  } catch {}
                }}
                className={`px-4 py-2 rounded-lg border ${selectedIds.length === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50'}`}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end space-x-2">
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}


