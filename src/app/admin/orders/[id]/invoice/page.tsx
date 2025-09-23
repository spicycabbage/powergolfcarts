import React from 'react'
import { headers } from 'next/headers'

async function getOrder(id: string) {
  try {
    const h = await headers()
    const host = h.get('host') || 'localhost:3000'
    const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const origin = `${proto}://${host}`
    const res = await fetch(`${origin}/api/admin/orders/${id}`, {
      cache: 'no-store',
      headers: { cookie: h.get('cookie') ?? '' }
    })
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return { success: false, error: `Unexpected response type: ${ct || 'unknown'}` }
    }
    return await res.json()
  } catch (e) {
    return { success: false, error: 'Failed to load invoice data' }
  }
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOrder(id)
  if (!data?.success) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load invoice: {data?.error || 'Unknown error'}</div>
      </div>
    )
  }
  const order = data.data
  const invoiceNumber = order?.invoiceNumber ?? (order?.orderNumber || order?._id)
  const items: any[] = Array.isArray(order?.items) ? order.items : []
  const subtotal = Number(order?.subtotal || 0)
  const bundleDiscount = Number(order?.bundleDiscount || 0)
  const shipping = Number(order?.shipping || 0)
  const total = Math.max(0, subtotal + shipping - bundleDiscount - Number(order?.coupon?.discount || 0))

  const fullName = `${order?.shippingAddress?.firstName || ''} ${order?.shippingAddress?.lastName || ''}`.trim()
  const addr1 = order?.shippingAddress?.address1 || ''
  const addr2 = order?.shippingAddress?.address2 || ''
  const city = order?.shippingAddress?.city || ''
  const state = order?.shippingAddress?.state || ''
  const postalCode = order?.shippingAddress?.postalCode || ''
  const country = order?.shippingAddress?.country || 'Canada'

  return (
    <div className="p-8 print:p-8 bg-white text-black">
      {/* Auto print on load */}
      <script dangerouslySetInnerHTML={{ __html: 'window.addEventListener("load", function(){ setTimeout(function(){ window.print && window.print(); }, 100); });' }} />
      <style>{`
        @media print {
          @page { margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Hide site chrome if loaded within app shell */
          header, footer, .announcement-bar, [data-announcement], .free-shipping-banner { display: none !important; }
        }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ccc; padding: 10px; font-size: 14px; }
        .table th { background: #f3f3f3; text-align: left; }
        .totals td { border: none !important; padding: 6px 0; font-size: 14px; }
        .totals .label { text-align: right; padding-right: 12px; }
        .totals .value { text-align: right; width: 120px; }
        .h1 { font-size: 28px; font-weight: 700; letter-spacing: 1px; }
        .section-title { font-weight: 600; margin-bottom: 6px; }
      `}</style>

      <div className="h1 mb-4">INVOICE</div>
      <hr className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <div className="section-title">Invoice Details</div>
          <div>Invoice #: {invoiceNumber}</div>
        </div>
        <div>
          <div className="section-title">Ship To</div>
          <div>{fullName || 'Customer'}</div>
          <div>{addr1}</div>
          {addr2 ? <div>{addr2}</div> : null}
          <div>{city}{city && (state || postalCode) ? ', ' : ''}{state} {postalCode}</div>
          <div>{country}</div>
        </div>
      </div>

      <table className="table mb-6">
        <thead>
          <tr>
            <th style={{ width: '50%' }}>Item Description</th>
            <th style={{ width: '15%' }}>Variant</th>
            <th style={{ width: '10%' }}>Qty</th>
            <th style={{ width: '12.5%' }}>Unit Price</th>
            <th style={{ width: '12.5%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it: any, idx: number) => {
            const quantity = Number(it?.quantity || 0)
            const lineTotal = Number(it?.total || 0)
            const unit = Number(it?.price ?? (quantity ? lineTotal / quantity : 0))
            const desc = it?.product?.name || it?.name || 'Item'
            const variant = it?.variant?.value || ''
            return (
              <tr key={idx}>
                <td>{desc}</td>
                <td>{variant}</td>
                <td>{quantity}</td>
                <td>${unit.toFixed(2)}</td>
                <td>${lineTotal.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <table className="totals ml-auto" style={{ width: 'auto' }}>
        <tbody>
          <tr>
            <td className="label">Subtotal:</td>
            <td className="value">${subtotal.toFixed(2)}</td>
          </tr>
          {bundleDiscount > 0 && (
            <tr>
              <td className="label" style={{ color: '#059669' }}>Bundle Discount:</td>
              <td className="value" style={{ color: '#059669' }}>-${bundleDiscount.toFixed(2)}</td>
            </tr>
          )}
          <tr>
            <td className="label">Shipping:</td>
            <td className="value">${shipping.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="label" style={{ fontWeight: 700 }}>Total:</td>
            <td className="value" style={{ fontWeight: 700 }}>${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-gray-700 mt-10">Thank you for your business!</div>
    </div>
  )
}


