export function buildOrderCompleteEmail(order: any): string {
  const invoice = order?.invoiceNumber ?? order?._id
  const items: any[] = Array.isArray(order?.items) ? order.items : []
  const subtotal = Number(order?.subtotal || 0)
  const shipping = Number(order?.shipping || 0)
  const total = Number(order?.total || (subtotal + shipping))

  const ship = order?.shippingAddress || {}
  const fullName = `${ship.firstName || ''} ${ship.lastName || ''}`.trim()

  const trackings: Array<{ carrier: string; number: string }> = Array.isArray(order?.tracking) && order.tracking.length > 0
    ? order.tracking.map((t: any) => ({ carrier: String(t?.carrier || ''), number: String(t?.number || '') }))
    : (order?.trackingCarrier && order?.trackingNumber ? [{ carrier: String(order.trackingCarrier), number: String(order.trackingNumber) }] : [])

  const trackingLinks = trackings.map(t => {
    const lc = t.carrier.toLowerCase()
    const nice = lc === 'canadapost' ? 'Canada Post' : (lc === 'purolator' ? 'Purolator' : t.carrier)
    const url = lc === 'canadapost'
      ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(t.number)}`
      : (lc === 'purolator' ? `https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(t.number)}` : '')
    const link = url ? `<a href="${url}" style="color:#2563eb;text-decoration:underline">${t.number}</a>` : t.number
    return `<div style="margin:2px 0">${nice} ${link}</div>`
  }).join('')

  const itemsRows = items.map((it: any) => {
    const name = it?.product?.name || it?.name || 'Item'
    const variant = it?.variant?.value ? ` (${it.variant.value})` : ''
    const qty = Number(it?.quantity || 0)
    const lineTotal = Number(it?.total || 0)
    const unit = qty ? lineTotal / qty : 0
    return `<tr>
      <td style="padding:8px;border:1px solid #e5e7eb">${name}${variant}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${qty}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${unit.toFixed(2)}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${lineTotal.toFixed(2)}</td>
    </tr>`
  }).join('')

  return `
  <div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb">
        <h1 style="margin:0;font-size:20px;line-height:28px">Order #${invoice} Complete</h1>
      </div>
      <div style="padding:20px 24px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px">
          <tr>
            <td valign="top" style="width:50%;padding-right:8px">
              <div style="font-weight:600;margin-bottom:6px">Invoice Details</div>
              <div>Invoice #: ${invoice}</div>
              <div>Total: $${total.toFixed(2)}</div>
            </td>
            <td valign="top" style="width:50%;padding-left:8px">
              <div style="font-weight:600;margin-bottom:6px">Ship To</div>
              <div>${fullName || 'Customer'}</div>
              <div>${ship.address1 || ''}</div>
              ${ship.address2 ? `<div>${ship.address2}</div>` : ''}
              <div>${ship.city || ''}, ${ship.state || ''} ${ship.postalCode || ''}</div>
              <div>${ship.country || ''}</div>
            </td>
          </tr>
        </table>

        ${trackings ? `<div style="margin:12px 0">
          <div style="font-weight:600;margin-bottom:6px">Tracking</div>
          ${trackingLinks || '<div>No tracking available yet.</div>'}
        </div>` : ''}

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px">
          <thead>
            <tr>
              <th align="left" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;text-transform:uppercase;color:#6b7280">Item</th>
              <th align="center" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;text-transform:uppercase;color:#6b7280">Qty</th>
              <th align="right" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;text-transform:uppercase;color:#6b7280">Unit</th>
              <th align="right" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:12px;text-transform:uppercase;color:#6b7280">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px">
          <tr>
            <td style="text-align:right;color:#6b7280;padding:4px 8px">Subtotal:</td>
            <td style="text-align:right;padding:4px 8px;width:140px">$${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align:right;color:#6b7280;padding:4px 8px">Shipping:</td>
            <td style="text-align:right;padding:4px 8px;width:140px">$${shipping.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align:right;font-weight:700;padding:6px 8px;border-top:1px solid #e5e7eb">Total:</td>
            <td style="text-align:right;font-weight:700;padding:6px 8px;border-top:1px solid #e5e7eb">$${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-align:center">
        Thank you for your business!
      </div>
    </div>
  </div>
  `
}


