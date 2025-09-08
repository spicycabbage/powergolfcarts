import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { getNavigationConfig } from '@/lib/navigationStore'
import { headers } from 'next/headers'

export default async function HeaderServer() {
  const navigation = await getNavigationConfig()
  const safeNav = JSON.parse(JSON.stringify(navigation))
  const h = await headers()
  const path = (h.get('x-invoke-path') || h.get('referer') || '') as string
  const isAdmin = path.includes('/admin')
  return (
    <>
      {!isAdmin && <AnnouncementBar banner={safeNav.header?.banner} />}
      <ConditionalHeader navigation={safeNav} />
    </>
  )
}


