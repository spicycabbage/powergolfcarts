import React from 'react'
import { headers } from 'next/headers'

async function getOrder(id: string) {
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`
  const res = await fetch(`${origin}/api/admin/orders/${id}`, { cache: 'no-store', headers: { cookie: h.get('cookie') ?? '' } })
  return res.json()
}

export default async function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOrder(id)
  if (!data?.success) {
    return <div className="p-6 text-red-600">Failed to load label</div>
  }
  const order = data.data
  const name = `${order?.shippingAddress?.firstName || ''} ${order?.shippingAddress?.lastName || ''}`.trim()
  return (
    <div className="p-0 bg-white">
      <script dangerouslySetInnerHTML={{ __html: 'window.addEventListener("load", function(){ setTimeout(function(){ window.print && window.print(); }, 100); });' }} />
      <style>{`
        @media print { @page { size: 4in 6in; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        .label { width: 4in; height: 6in; padding: 12px; }
      `}</style>
      <div className="label">
        <div className="text-2xl font-bold mb-2">{name}</div>
        <div className="text-lg">{order?.shippingAddress?.address1}</div>
        {order?.shippingAddress?.address2 ? <div className="text-lg">{order.shippingAddress.address2}</div> : null}
        <div className="text-lg">{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}</div>
        <div className="text-lg">Canada</div>
      </div>
    </div>
  )
}


