'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useSearchParams } from 'next/navigation'

export default function ConfirmationClient({ order: initialOrder, payment: initialPayment }: { order?: any, payment?: any }) {
  const { cart, clearCart } = useCart()
  const [shipping, setShipping] = useState<any>(initialOrder?.shippingAddress || null)
  const [payment, setPayment] = useState<any>(initialPayment || null)
  const [items, setItems] = useState<any[]>(Array.isArray(initialOrder?.items) ? initialOrder.items.map((it: any) => ({
    name: it?.product?.name || 'Item', price: Number(it?.price || it?.product?.price || 0), quantity: Number(it?.quantity || 1), variant: it?.variant,
  })) : [])
  const searchParams = useSearchParams()
  const [hydrated, setHydrated] = useState(false)
  const [paymentLoaded, setPaymentLoaded] = useState(Boolean(initialPayment))
  const [orderMeta, setOrderMeta] = useState<{ id?: string, createdAt?: string, email?: string } | null>(initialOrder ? {
    id: String(initialOrder.invoiceNumber || initialOrder._id),
    createdAt: initialOrder.createdAt,
    email: initialOrder?.user?.email,
  } : null)
  const [summary, setSummary] = useState<{ itemCount: number, subtotal: number, couponDiscount?: number, shipping: number, total: number }>({
    itemCount: Array.isArray(initialOrder?.items) ? initialOrder.items.reduce((s: number, it: any) => s + Number(it?.quantity || 0), 0) : 0,
    subtotal: Number(initialOrder?.subtotal || 0),
    couponDiscount: Number(initialOrder?.coupon?.discount || 0),
    shipping: Number(initialOrder?.shipping || 0),
    total: Number(initialOrder?.total || 0),
  })
  const [appliedCoupon, setAppliedCoupon] = useState<any>(initialOrder?.coupon || null)

  useEffect(() => { setHydrated(true) }, [])

  const formatPSTDate = (iso?: string) => {
    if (!iso) return '—'
    const d = new Date(iso)
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    const parts = dtf.formatToParts(d).reduce((acc: any, p) => { acc[p.type] = p.value; return acc }, {})
    return `${parts.year}-${parts.month}-${parts.day}`
  }

  // Load payment if not provided
  useEffect(() => {
    if (initialPayment) return
    ;(async () => {
      try {
        const res = await fetch('/api/payment', { cache: 'no-store' })
        const json = await res.json().catch(() => ({} as any))
        if (json?.success !== false) setPayment(json?.data || null)
        setPaymentLoaded(true)
      } catch {}
    })()
  }, [initialPayment])

  // If order id exists, fetch definitive order from DB only if not provided by server
  useEffect(() => {
    if (initialOrder) return
    const id = searchParams.get('order')
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({} as any))
        const order = json?.data
        if (order) {
          setItems(Array.isArray(order.items) ? order.items.map((it: any) => ({
            name: it?.product?.name || 'Item',
            price: Number(it?.price ?? it?.product?.price ?? 0),
            quantity: Number(it?.quantity || 1),
            variant: it?.variant,
          })) : [])
          setSummary({
            itemCount: Array.isArray(order.items) ? order.items.reduce((s: number, it: any) => s + Number(it?.quantity || 0), 0) : 0,
            subtotal: Number(order.subtotal || 0),
            couponDiscount: Number(order.coupon?.discount || 0),
            shipping: Number(order.shipping || 0),
            total: Number(order.total || 0),
          })
          setAppliedCoupon(order.coupon || null)
          setShipping(order.shippingAddress || null)
          setOrderMeta({ id: String(order.invoiceNumber || order._id), createdAt: order.createdAt, email: (order as any)?.user?.email })
        }
      } catch {}
    })()
  }, [initialOrder, searchParams])

  // If no order id, create order once items and shipping loaded (client path)
  useEffect(() => {
    if (initialOrder) return
    try {
      const saved = sessionStorage.getItem('checkout_items')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    try {
      const saved = sessionStorage.getItem('checkout_shipping')
      if (saved) setShipping(JSON.parse(saved))
    } catch {}
  }, [initialOrder])

  const subtotal = summary.subtotal
  const shippingCost = summary.shipping
  const total = summary.total

  const effectiveCoupon = appliedCoupon || initialOrder?.coupon || null
  const effectiveDiscount = Number(
    (summary.couponDiscount != null ? summary.couponDiscount : (effectiveCoupon?.discount ?? 0)) || 0
  )

  useEffect(() => {
    if (initialOrder) return
    try {
      const saved = sessionStorage.getItem('checkout_order_summary')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSummary({ 
          itemCount: Number(parsed?.itemCount || 0), 
          subtotal: Number(parsed?.subtotal || 0), 
          couponDiscount: Number(parsed?.couponDiscount || 0),
          shipping: Number(parsed?.shipping || 0), 
          total: Number(parsed?.total || 0) 
        })
        setAppliedCoupon(parsed?.appliedCoupon || null)
      } else {
        const items = cart.items.map((it) => ({
          name: it.product.name,
          price: Number(((it as any)?.variant?.price != null ? (it as any).variant.price : it.product.price) || 0),
          quantity: it.quantity,
          variant: it.variant,
        }))
        setItems(items)
        setSummary({ itemCount: items.reduce((s, it) => s + Number(it.quantity||0), 0), subtotal: items.reduce((s, it) => s + Number(it.price||0) * Number(it.quantity||1), 0), shipping: 0, total: items.reduce((s, it) => s + Number(it.price||0) * Number(it.quantity||1), 0) })
      }
    } catch {
      setSummary({ itemCount: cart.items.reduce((s, it) => s + it.quantity, 0), subtotal: cart.subtotal, shipping: 0, total: cart.subtotal })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder, cart.items, cart.subtotal])

  useEffect(() => {
    if (initialOrder) return
    // Create order if missing order id
    const existingOrderId = searchParams.get('order')
    if (existingOrderId) {
      if (cart.items.length > 0) clearCart()
      return
    }
    if (!shipping || !Array.isArray(items) || items.length === 0) return
    ;(async () => {
      try {
        const payload = { 
          items, 
          subtotal, 
          couponDiscount: summary.couponDiscount || 0,
          appliedCoupon,
          shipping: shippingCost, 
          total, 
          shippingAddress: shipping 
        }
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json().catch(() => ({} as any))
        if (json?.success && json?.data?.id) {
          const url = new URL(window.location.href)
          url.searchParams.set('order', json.data.id)
          window.history.replaceState(null, '', url.toString())
        }
        if (cart.items.length > 0) clearCart()
      } catch {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder, shipping, items, subtotal, shippingCost, total])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Confirmation</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-6 text-sm">
            <div className="sm:col-span-3">
              <div className="text-gray-500">Order number</div>
              <div className="font-medium text-gray-900 break-all">{orderMeta?.id || searchParams.get('order') || '–'}</div>
            </div>
            <div className="sm:col-span-3">
              <div className="text-gray-500">Date</div>
              <div className="font-medium text-gray-900">{formatPSTDate(orderMeta?.createdAt || initialOrder?.createdAt)}</div>
            </div>
            <div className="sm:col-span-5 min-w-0">
              <div className="text-gray-500">Email</div>
              <div className="font-medium text-gray-900 break-all">{typeof window !== 'undefined' ? (JSON.parse(sessionStorage.getItem('checkout_shipping')||'{}')?.email || orderMeta?.email || '—') : '—'}</div>
            </div>
            <div className="sm:col-span-1 text-right">
              <div className="text-gray-500">Total</div>
              <div className="font-medium text-gray-900">{`$${total.toFixed(2)}`}</div>
            </div>
          </div>
        </div>

        {paymentLoaded && payment?.etransfer?.enabled !== false && (
          <div className="rounded-lg p-0 mb-6 border-2 border-green-700 overflow-hidden">
            <div className="bg-green-700 text-white px-4 py-3 font-semibold uppercase text-sm tracking-wide">Interac e-Transfer Instructions</div>
            <div className="bg-green-50 px-4 py-4">
              {payment?.etransfer?.note && (
                <p className="text-sm text-gray-800 whitespace-pre-line">{payment.etransfer.note}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

          {(hydrated || initialOrder) && Array.isArray(items) && items.length > 0 && (
            <div className="mb-4">
              <ul className="divide-y divide-gray-200">
                {items.map((it, idx) => (
                  <li key={idx} className="py-3 grid grid-cols-6 gap-3 items-start">
                    <div className="col-span-4 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{it.name}{it.variant ? ` — ${it.variant.name}: ${it.variant.value}` : ''}</div>
                      <div className="text-xs text-gray-500">Qty: {it.quantity}{typeof it.price === 'number' ? ` • $${Number(it.price).toFixed(2)} each` : ''}</div>
                    </div>
                    <div className="col-span-2 text-right text-sm text-gray-900">${(Number(it.price||0) * Number(it.quantity||1)).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="border-t-2 border-gray-800 pt-3 flex justify-between"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">${subtotal.toFixed(2)}</span></div>
            {effectiveCoupon?.code && (
              <div className="flex justify-between"><span className="text-green-600">Discount ({effectiveCoupon.code})</span><span className="text-green-600">-${effectiveDiscount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="text-gray-900">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span></div>
            <div className="border-t-2 border-gray-800 pt-3 flex justify-between text-base font-semibold"><span className="text-gray-900">Total</span><span className="text-gray-900">${total.toFixed(2)}</span></div>
          </div>

          {shipping && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping To</h4>
              <div className="text-sm text-gray-700">
                <div>{shipping.firstName} {shipping.lastName}</div>
                <div>{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ''}</div>
                <div>{shipping.city}, {shipping.state} {shipping.postalCode}</div>
                <div>{shipping.country}</div>
                {shipping.phone ? <div>{shipping.phone}</div> : null}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link href="/" className="inline-block bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}


