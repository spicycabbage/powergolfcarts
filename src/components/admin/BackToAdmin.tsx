"use client"
import Link from 'next/link'

export default function BackToAdmin({ label = 'Back to Admin' }: { label?: string }) {
  return (
    <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
      {label}
    </Link>
  )
}



