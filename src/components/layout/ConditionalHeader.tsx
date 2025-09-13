'use client'

import { usePathname } from 'next/navigation'
import { SimpleHeader } from './SimpleHeader'

export function ConditionalHeader() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <SimpleHeader />
}


