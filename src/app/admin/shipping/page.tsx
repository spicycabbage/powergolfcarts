import ShippingAdminClient from '@/components/admin/ShippingAdminClient'
import { getShippingSettings } from '@/lib/shippingStore'

export default async function AdminShippingPage() {
  const data = await getShippingSettings()
  const initial = {
    freeShippingThreshold: Number(data?.freeShippingThreshold || 50),
    methods: Array.isArray(data?.methods) ? data.methods : []
  }
  return <ShippingAdminClient initial={initial} />
}


