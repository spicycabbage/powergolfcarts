import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { getNavigationConfig } from '@/lib/navigationStore'
import { headers } from 'next/headers'

export default async function HeaderServer() {
  let navigation
  try {
    navigation = await getNavigationConfig()
  } catch (error) {
    console.error('Failed to load navigation config:', error)
    // Use default navigation if database fails
    navigation = {
      header: { logo: { text: 'Godbud.cc', href: '/', useImage: false } },
      secondaryNav: [
        { name: 'About Us', href: '/about' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact Us', href: '/contact' }
      ],
      primaryNav: []
    }
  }
  
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


