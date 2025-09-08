"use client"
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BackToAdmin({ label = 'Back to Orders', href = '/admin/orders' }: { label?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <ChevronLeft className="w-4 h-4 mr-2" />
      {label}
    </Link>
  )
}



