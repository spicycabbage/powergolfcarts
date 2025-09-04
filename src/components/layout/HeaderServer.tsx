import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { getNavigationConfig } from '@/lib/navigationStore'

export default async function HeaderServer() {
  const navigation = await getNavigationConfig()
  const safeNav = JSON.parse(JSON.stringify(navigation))
  return (
    <>
      <AnnouncementBar banner={safeNav.header?.banner} />
      <ConditionalHeader navigation={safeNav} />
    </>
  )
}


