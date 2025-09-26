'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { BackButton } from '@/components/admin/BackButton'
import { formatDateMMMDDYYYY } from '@/utils/dates'

export default function AdminOrderDetail() {
  const { id } = useParams() as { id: string }
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingCarrier, setTrackingCarrier] = useState('')
  const [editingTracking, setEditingTracking] = useState(false)

  const savedTrackingUrl = useMemo(() => {
    const carrier = String(order?.trackingCarrier || '').toLowerCase()
    const num = String(order?.trackingNumber || '').trim()
    if (!carrier || !num) return ''
    if (carrier === 'canadapost' || carrier === 'canada post' || carrier === 'canada-post') {
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(num)}`
    }
    if (carrier === 'purolator') {
      return `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(num)}`
    }
    return ''
  }, [order])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch order')
      setOrder(json.data)
      setTrackingNumber(String(json.data?.trackingNumber || ''))
      setTrackingCarrier(String(json.data?.trackingCarrier || ''))
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) void fetchOrder() }, [id])

  const statusBadge = useMemo(() => {
    const s = String(order?.status || '').toLowerCase()
    const palette: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-700',
      refunded: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-emerald-100 text-emerald-800',
    }
    return palette[s] || 'bg-gray-100 text-gray-700'
  }, [order])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and actions move inside loaded state to avoid placeholder flicker */}

        {loading ? (
          <div className="bg-white p-6 rounded-lg border">Loading…</div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg border text-red-600">{error}</div>
        ) : !order ? null : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">Order {order?.invoiceNumber ?? (order?.orderNumber || id)}</h1>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge}`}>{String(order?.status || '').toUpperCase()}</span>
              </div>
              <BackButton to="/admin/orders" />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{order?.user?.email || order?.contactEmail || order?.shippingAddress?.email || '-'}</span>
              <span>•</span>
              <span>{order?.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</span>
            </div>
            {/* Top actions removed; actions exist on the right column */}
            {/* Two columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Order #</h3>
                      <div className="text-sm text-gray-900">{order.invoiceNumber ?? (order.orderNumber || order._id)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Ship To</h3>
                      <div className="text-sm text-gray-700 space-y-0.5">
                        <div>{order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}</div>
                        <div>{order?.shippingAddress?.address1}{order?.shippingAddress?.address2 ? `, ${order.shippingAddress.address2}` : ''}</div>
                        <div>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}</div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Items</h3>
                  <ul className="divide-y divide-gray-200 text-sm">
                    {order.items?.map((it: any, idx: number) => (
                      <li key={idx} className="py-3 flex items-center justify-between">
                        <div className="mr-4 min-w-0">
                          <div className="text-gray-900 truncate">{it?.product?.name || it?.name || 'Item'}</div>
                          {it.variant?.name && (
                            <div className="text-gray-500">{it.variant.name}: {it.variant.value}</div>
                          )}
                          <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                        </div>
                        <div className="text-gray-900">${Number(it.total||0).toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t pt-3 text-sm">
                    <div className="flex items-center justify-between"><span className="text-gray-600">Subtotal:</span><span>${Number(order.subtotal||0).toFixed(2)}</span></div>
                    {order.bundleDiscount && Number(order.bundleDiscount) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">Bundle Discount:</span>
                        <span className="text-green-600">-${Number(order.bundleDiscount).toFixed(2)}</span>
                      </div>
                    )}
                    {order.coupon && (
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">Discount ({order.coupon.code}):</span>
                        <span className="text-green-600">-${Number(order.coupon.discount||0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between"><span className="text-gray-600">Shipping:</span><span>${Number(order.shipping||0).toFixed(2)}</span></div>
                    <div className="mt-2 flex items-center justify-between font-semibold"><span>Total:</span><span>${Math.max(0, Number(order.subtotal||0) + Number(order.shipping||0) - Number(order.bundleDiscount||0) - Number(order.coupon?.discount||0)).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
              {/* Right column */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <div className="text-gray-700 space-y-1">
                    <div>Interac e‑Transfer</div>
                    <div>Status: <span className={`px-2 py-0.5 rounded text-xs ${statusBadge}`}>{String(order?.status || '').toUpperCase()}</span></div>
                  </div>
                </div>
                
                {order.coupon && (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Applied Coupon</h3>
                    <div className="text-gray-700 space-y-1">
                      <div className="font-medium text-green-600">{order.coupon.code}</div>
                      <div className="text-xs text-gray-500">{order.coupon.name}</div>
                      <div className="text-xs">
                        {order.coupon.type === 'percentage' 
                          ? `${order.coupon.value}% discount` 
                          : `$${order.coupon.value} discount`}
                      </div>
                      <div className="font-medium text-green-600">Saved: $${Number(order.coupon.discount||0).toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tracking</h3>
                  {!editingTracking ? (
                    <div className="space-y-2">
                      <button
                        className="px-3 py-2 rounded bg-indigo-600 text-white w-1/2"
                        onClick={() => setEditingTracking(true)}
                      >
                        Add Tracking Info
                      </button>
                      {/* Render list of tracking entries if available; fallback to single fields */}
                      {Array.isArray(order?.tracking) && order.tracking.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {order.tracking.map((t: any, idx: number) => {
                            const carrier = String(t?.carrier || '')
                            const num = String(t?.number || '')
                            const lc = carrier.toLowerCase()
                            const nice = lc==='canadapost' ? 'Canada Post' : (lc==='purolator' ? 'Purolator' : carrier)
                            const url = lc==='canadapost' ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(num)}` : (lc==='purolator' ? `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(num)}` : '')
                            const added = t?.createdAt ? formatDateMMMDDYYYY(t.createdAt) : ''
                            return (
                              <li key={idx} className="flex items-center gap-2">
                                {added ? <span className="text-gray-500">{added}</span> : null}
                                <span>{nice}</span>
                                {url ? (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{num}</a>
                                ) : (
                                  <span>{num}</span>
                                )}
                                <button
                                  onClick={async()=>{ if(!confirm('Delete this tracking entry?')) return; setSaving(true); try { const res=await fetch(`/api/admin/orders/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({ deleteTracking: { carrier, number: num } })}); const j=await res.json(); if(!j.success) throw new Error(j.error||'Failed to delete tracking'); setOrder((p:any)=>({ ...p, tracking: j.data?.tracking || [], trackingCarrier: j.data?.trackingCarrier, trackingNumber: j.data?.trackingNumber })) } catch(e:any){ alert(e?.message||'Failed to delete') } finally { setSaving(false) } }}
                                  className="text-red-600 hover:underline"
                                >Delete</button>
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        (order?.trackingNumber && order?.trackingCarrier) ? (
                          <div className="text-xs text-gray-600">
                            {(String(order.trackingCarrier).toLowerCase()==='canadapost' ? 'Canada Post' : (String(order.trackingCarrier).toLowerCase()==='purolator' ? 'Purolator' : String(order.trackingCarrier)))}{' '}
                            {savedTrackingUrl ? (
                              <a href={savedTrackingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{order.trackingNumber}</a>
                            ) : (
                              <span>{order.trackingNumber}</span>
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
                        <select
                          className="px-3 py-2 border rounded-lg bg-white w-full min-w-0"
                          value={trackingCarrier}
                          onChange={(e)=>setTrackingCarrier(e.target.value)}
                        >
                          <option value="">Select Carrier</option>
                          <option value="canadapost">CanadaPost</option>
                          <option value="purolator">Purolator</option>
                        </select>
                        <input
                          value={trackingNumber}
                          onChange={(e)=>setTrackingNumber(e.target.value)}
                          placeholder="Tracking number"
                          className="px-3 py-2 border rounded-lg w-full min-w-0"
                        />
                      </div>
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          onClick={async ()=>{ setSaving(true); try { const res=await fetch(`/api/admin/orders/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({ addTracking: { carrier: trackingCarrier, number: trackingNumber } })}); const j=await res.json(); if(!j.success) throw new Error(j.error||'Failed to save tracking'); setOrder((p:any)=>{ const prev = Array.isArray(p?.tracking) ? p.tracking : []; const next = Array.isArray(j.data?.tracking) ? j.data.tracking : [...prev, { carrier: trackingCarrier, number: trackingNumber }]; return { ...p, trackingCarrier, trackingNumber, tracking: next }; }); setEditingTracking(false); setTrackingNumber(''); setTrackingCarrier(''); } catch(e:any){ alert(e?.message||'Failed to save tracking') } finally { setSaving(false) } }}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          disabled={saving}
                        >Save</button>
                        <button
                          onClick={()=>{ setTrackingNumber(String(order?.trackingNumber||'')); setTrackingCarrier(String(order?.trackingCarrier||'')); setEditingTracking(false) }}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          disabled={saving}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={async()=>{ try { setSaving(true); const res = await fetch(`/api/admin/orders/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'completed'})}); const j=await res.json(); if(!j.success) throw new Error(j.error||'Failed to complete order'); setOrder((p:any)=>({...p,status:'completed'})); toast.success('Order marked as completed') } catch(e:any){ toast.error(e?.message||'Failed to complete order') } finally { setSaving(false) } }} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 w-full disabled:opacity-50" disabled={saving}>Complete Order</button>
                    <button onClick={async()=>{ 
                      try { 
                        console.log('🔄 Cancel button clicked for order:', id)
                        setSaving(true); 
                        console.log('📡 Sending cancel request...')
                        const res = await fetch(`/api/admin/orders/${id}`,{
                          method:'PUT',
                          headers:{'Content-Type':'application/json'},
                          body:JSON.stringify({status:'cancelled'})
                        }); 
                        console.log('📡 Cancel response status:', res.status)
                        const j=await res.json(); 
                        console.log('📡 Cancel response data:', j)
                        if(!j.success) throw new Error(j.error||'Failed to cancel order'); 
                        setOrder((p:any)=>({...p,status:'cancelled'})); 
                        toast.success('Order cancelled successfully') 
                      } catch(e:any){ 
                        console.error('❌ Cancel error:', e)
                        toast.error(e?.message||'Failed to cancel order') 
                      } finally { 
                        setSaving(false) 
                      } 
                    }} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 w-full disabled:opacity-50" disabled={saving}>Cancel Order</button>
                    <button onClick={()=>{ window.open(`/admin/orders/${id}/invoice`, '_blank', 'noopener,noreferrer') }} className="px-3 py-2 rounded border hover:bg-gray-50 w-full text-center">Print Invoice</button>
                    <button onClick={()=>{ window.open(`/admin/orders/${id}/label`, '_blank', 'noopener,noreferrer') }} className="px-3 py-2 rounded border hover:bg-gray-50 w-full text-center">Print Label</button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}


