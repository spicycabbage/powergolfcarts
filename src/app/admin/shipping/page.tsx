import ShippingAdminClient from '@/components/admin/ShippingAdminClient'
import { getShippingSettings } from '@/lib/shippingStore'

// Prevent static generation for admin pages that require database access
export const dynamic = 'force-dynamic'

export default async function AdminShippingPage() {
  // This page should not be statically generated as it requires database access
  // The getShippingSettings function will handle build-time gracefully
  const data = await getShippingSettings()
  const initial = {
    freeShippingThreshold: Number(data?.freeShippingThreshold || 50),
    methods: Array.isArray(data?.methods) ? data.methods : []
  }
  return <ShippingAdminClient initial={initial} />
}


