'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useSearchParams } from 'next/navigation'

export default function ConfirmationClient({ order: initialOrder, payment: initialPayment, initialInvoice }: { order?: any, payment?: any, initialInvoice?: number }) {
  const { cart, clearCart } = useCart()
  const [shipping, setShipping] = useState<any>(initialOrder?.shippingAddress || null)
  const [payment, setPayment] = useState<any>(initialPayment || null)
  const [items, setItems] = useState<any[]>(Array.isArray(initialOrder?.items) ? initialOrder.items.map((it: any) => ({
    name: it?.product?.name || 'Item', price: Number(it?.price || it?.product?.price || 0), quantity: Number(it?.quantity || 1), variant: it?.variant,
  })) : [])
  const searchParams = useSearchParams()
  const [hydrated, setHydrated] = useState(false)
  const [paymentLoaded, setPaymentLoaded] = useState(Boolean(initialPayment))
  const [orderMeta, setOrderMeta] = useState<{ id?: string, createdAt?: string, email?: string, paymentMethod?: string } | null>(initialOrder ? {
    id: String(initialOrder.invoiceNumber || initialOrder._id),
    createdAt: initialOrder.createdAt,
    email: initialOrder?.user?.email,
    paymentMethod: initialOrder?.paymentMethod?.type,
  } : (initialInvoice ? { id: String(initialInvoice) } : null))
  const [summary, setSummary] = useState<{ itemCount: number, subtotal: number, bundleDiscount?: number, couponDiscount?: number, shipping: number, total: number }>({
    itemCount: Array.isArray(initialOrder?.items) ? initialOrder.items.reduce((s: number, it: any) => s + Number(it?.quantity || 0), 0) : 0,
    subtotal: Number(initialOrder?.subtotal || 0),
    bundleDiscount: Number(initialOrder?.bundleDiscount || 0),
    couponDiscount: Number(initialOrder?.coupon?.discount || 0),
    shipping: Number(initialOrder?.shipping || 0),
    total: Number(initialOrder?.total || 0),
  })
  const [appliedCoupon, setAppliedCoupon] = useState<any>(initialOrder?.coupon || null)

  useEffect(() => { setHydrated(true) }, [])
  // Prime from sessionStorage on first paint
  useEffect(() => {
    try {
      const iv = sessionStorage.getItem('lastInvoice')
      if (iv && !orderMeta?.id) setOrderMeta(prev => ({ ...(prev || {}), id: iv }))
    } catch {}
  }, [])



  // Date removed from header on request; no date formatting needed

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
            bundleDiscount: Number(order.bundleDiscount || 0),
            couponDiscount: Number(order.coupon?.discount || 0),
            shipping: Number(order.shipping || 0),
            total: Number(order.total || 0),
          })
          setAppliedCoupon(order.coupon || null)
          setShipping(order.shippingAddress || null)
          setOrderMeta({ 
            id: String(order.invoiceNumber || order._id), 
            createdAt: order.createdAt, 
            email: (order as any)?.user?.email,
            paymentMethod: order?.paymentMethod?.type 
          })
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
  const bundleDiscount = (summary as any)?.bundleDiscount || 0
  const shippingCost = summary.shipping

  const effectiveCoupon = appliedCoupon || initialOrder?.coupon || null
  const effectiveDiscount = Number(
    (summary.couponDiscount != null ? summary.couponDiscount : (effectiveCoupon?.discount ?? 0)) || 0
  )
  
  // Calculate correct total: subtotal - bundleDiscount - couponDiscount + shipping
  const total = Math.max(0, subtotal - bundleDiscount - effectiveDiscount + shippingCost)

  useEffect(() => {
    if (initialOrder) return
    try {
      const saved = sessionStorage.getItem('checkout_order_summary')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSummary({ 
          itemCount: Number(parsed?.itemCount || 0), 
          subtotal: Number(parsed?.subtotal || 0), 
          bundleDiscount: Number(parsed?.bundleDiscount || 0),
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
        const calculatedSubtotal = items.reduce((s, it) => s + Number(it.price||0) * Number(it.quantity||1), 0)
        setSummary({ itemCount: items.reduce((s, it) => s + Number(it.quantity||0), 0), subtotal: calculatedSubtotal, bundleDiscount: 0, shipping: 0, total: calculatedSubtotal })
      }
    } catch {
      setSummary({ itemCount: cart.items.reduce((s, it) => s + it.quantity, 0), subtotal: cart.subtotal, bundleDiscount: 0, shipping: 0, total: cart.subtotal })
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
        // Persist/generate idempotency key for this browser session
        let idem = ''
        try {
          idem = sessionStorage.getItem('checkout_idem') || ''
        } catch {}
        if (!idem) {
          idem = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
          try { sessionStorage.setItem('checkout_idem', idem) } catch {}
        }
        // Get referral data from sessionStorage
        let referralData = null
        try {
          const storedReferral = sessionStorage.getItem('checkout_referral')
          if (storedReferral) {
            referralData = JSON.parse(storedReferral)
          }
        } catch {}
        
        const payload = { 
          items, 
          subtotal, 
          bundleDiscount: (summary as any)?.bundleDiscount || 0,
          couponDiscount: summary.couponDiscount || 0,
          appliedCoupon,
          shipping: shippingCost, 
          total, 
          shippingAddress: shipping,
          customerEmail: (shipping as any)?.email || orderMeta?.email || '',
          idempotencyKey: idem,
          referralData
        }
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json().catch(() => ({} as any))
        if (json?.success && json?.data?.id) {
          const url = new URL(window.location.href)
          url.searchParams.set('order', json.data.id)
          if (json.data.invoiceNumber) url.searchParams.set('invoice', String(json.data.invoiceNumber))
          window.history.replaceState(null, '', url.toString())
          // Immediately show the real invoice number in UI and persist for refreshes
          if (json.data.invoiceNumber) {
            const inv = String(json.data.invoiceNumber)
            setOrderMeta({ id: inv, createdAt: new Date().toISOString(), email: (shipping as any)?.email })
            try { sessionStorage.setItem('lastInvoice', inv) } catch {}
          }
        }
        if (cart.items.length > 0) clearCart()
        // Clear all checkout data from session storage after successful order creation
        try {
          sessionStorage.removeItem('checkout_idem')
          sessionStorage.removeItem('checkout_items')
          sessionStorage.removeItem('checkout_shipping')
          sessionStorage.removeItem('checkout_selected_shipping')
          sessionStorage.removeItem('checkout_order_summary')
          sessionStorage.removeItem('checkout_applied_coupon')
          sessionStorage.removeItem('checkout_referral')
        } catch {}
      } catch {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder, shipping, items, subtotal, shippingCost, total])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Order Confirmation</h1>
          
          <p className="text-lg text-gray-700 mb-8">
            Thank you. We have received your order and it will be shipped out shortly.
          </p>

          <div className="mt-8">
            <Link href="/" className="inline-block bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 font-medium transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


