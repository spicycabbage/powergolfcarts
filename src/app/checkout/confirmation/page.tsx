import ConfirmationClient from '@/components/checkout/ConfirmationClient'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const h = await headers()
  const s = await searchParams
  const orderParam = s?.order
  const orderId = Array.isArray(orderParam) ? orderParam[0] : orderParam
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`

  const fetches: Promise<any>[] = []
  const metaPromise = orderId
    ? fetch(`${origin}/api/orders/${orderId}?meta=1`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({} as any))
    : Promise.resolve({})
  fetches.push(metaPromise)
  fetches.push(fetch(`${origin}/api/payment`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({} as any)))

  const [metaJson, paymentJson] = await Promise.all(fetches)
  const initialInvoice = metaJson?.data?.invoiceNumber ?? null
  const payment = paymentJson?.success === false ? null : (paymentJson?.data || null)

  return <ConfirmationClient payment={payment} initialInvoice={initialInvoice} />
}


