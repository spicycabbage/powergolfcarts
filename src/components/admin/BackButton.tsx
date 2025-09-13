'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    // If we're in an admin page, go back to admin dashboard
    if (pathname.startsWith('/admin/')) {
      router.push('/admin')
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  )
}
