import ConfirmationClient from '@/components/checkout/ConfirmationClient'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const h = await headers()
  const s = await searchParams
  const orderParam = s?.order
  const orderId = Array.isArray(orderParam) ? orderParam[0] : orderParam
  const invoiceParam = s?.invoice
  const invoiceFromUrl = Array.isArray(invoiceParam) ? invoiceParam[0] : invoiceParam
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`

  const fetches: Promise<any>[] = []
  // If invoice present in URL, skip meta fetch altogether
  const metaPromise = invoiceFromUrl
    ? Promise.resolve({ data: { invoiceNumber: invoiceFromUrl } })
    : (orderId
      ? fetch(`${origin}/api/orders/${orderId}?meta=1`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({} as any))
      : Promise.resolve({}))
  fetches.push(metaPromise)
  fetches.push(fetch(`${origin}/api/payment`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({} as any)))

  const [metaJson, paymentJson] = await Promise.all(fetches)
  const initialInvoice = (invoiceFromUrl ?? metaJson?.data?.invoiceNumber ?? null) as any
  const payment = paymentJson?.success === false ? null : (paymentJson?.data || null)

  return <ConfirmationClient payment={payment} initialInvoice={initialInvoice ? Number(initialInvoice) : undefined} />
}


