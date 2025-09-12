'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Folder, 
  BarChart3,
  Users,
  Package,
  Mail
} from 'lucide-react'
import Link from 'next/link'
 

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  // Removed inventory state from dashboard to speed up initial load

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'admin') {
      router.push('/account')
      return
    }

    setIsChecking(false)
  }, [session, status, router])

  // no inventory fetching here

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const adminTools = [
    {
      title: 'Navigation Management',
      icon: Settings,
      href: '/admin/navigation',
      color: 'bg-blue-500'
    },
    {
      title: 'Category Management',
      icon: Folder,
      href: '/admin/categories',
      color: 'bg-green-500'
    },
    {
      title: 'Inventory Management',
      icon: Settings,
      href: '/admin/inventory',
      color: 'bg-gray-500'
    },
    // Removed Product Import per request
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '#',
      color: 'bg-orange-500',
      disabled: true
    },
    {
      title: 'User Management',
      icon: Users,
      href: '#',
      color: 'bg-red-500',
      disabled: true
    },
    {
      title: 'Shipping',
      icon: Settings,
      href: '/admin/shipping',
      color: 'bg-blue-600',
      disabled: false
    },
    {
      title: 'Payment Options',
      icon: Settings,
      href: '/admin/payment',
      color: 'bg-amber-600',
      disabled: false
    },
    {
      title: 'View Orders',
      icon: Settings,
      href: '/admin/orders',
      color: 'bg-emerald-600',
      disabled: false
    },
    {
      title: 'Create Product',
      icon: Package,
      href: '/admin/products/new',
      color: 'bg-indigo-500',
      disabled: false
    },
    {
      title: 'Reviews Moderation',
      icon: Users,
      href: '/admin/reviews',
      color: 'bg-purple-500',
      disabled: false
    },
    {
      title: 'Pages',
      icon: Settings,
      href: '/admin/pages',
      color: 'bg-purple-500',
      disabled: false
    },
    {
      title: 'Blog',
      icon: Settings,
      href: '/admin/blog',
      color: 'bg-teal-500',
      disabled: false
    },
    {
      title: 'Email Subscribers',
      icon: Mail,
      href: '/admin/email-subscribers',
      color: 'bg-pink-500',
      disabled: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {session?.user?.name || 'Admin'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Tools</h2>
          <p className="text-gray-600">Manage your ecommerce store settings and content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool) => {
            const Icon = tool.icon
            if (tool.disabled) {
              return (
                <div
                  key={tool.title}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50 cursor-not-allowed text-center"
                  aria-disabled
                >
                  <span className="text-base font-semibold text-gray-700">{tool.title}</span>
                </div>
              )
            }
            return (
              <Link
                key={tool.title}
                href={tool.href}
                prefetch
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 hover:bg-gray-50 text-center"
              >
                <span className="text-base font-semibold text-gray-900" style={{ pointerEvents: 'none' }}>{tool.title}</span>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
