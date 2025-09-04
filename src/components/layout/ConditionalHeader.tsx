'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

type NavigationItem = {
  name: string
  href: string
  categoryId?: string
  isActive?: boolean
  children?: NavigationItem[]
}

type NavigationConfig = {
  header: {
    logo: { text: string; href: string; image?: string; useImage: boolean }
    banner?: { text: string; isActive: boolean }
  }
  secondaryNav: NavigationItem[]
  primaryNav: NavigationItem[]
}

export function ConditionalHeader({ navigation }: { navigation?: NavigationConfig }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <Header initialNavigation={navigation} />
}


