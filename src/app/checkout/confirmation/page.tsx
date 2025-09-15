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

  return (
    <>
      {/* Server-rendered minimal header for instant Order # display */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 text-sm grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <div className="text-gray-500">Order number</div>
              <div className="font-medium text-gray-900 break-all">{String(initialInvoice || orderId || '–')}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationClient payment={payment} initialInvoice={initialInvoice ? Number(initialInvoice) : undefined} ssrHeader />
    </>
  )
}


