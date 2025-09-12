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
  Mail,
  Link2
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading admin panel...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your dashboard</p>
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
      href: '/admin/analytics',
      color: 'bg-orange-500',
      disabled: false
    },
    {
      title: 'User Management',
      icon: Users,
      href: '/admin/users',
      color: 'bg-red-500',
      disabled: false
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
    },
    {
      title: 'Slug Manager',
      icon: Link2,
      href: '/admin/slug-manager',
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full">
              <span className="text-sm text-white">
                Welcome, <span className="font-medium">{session?.user?.name || 'Admin'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Admin Tools</h2>
          <p className="text-lg text-gray-600">Manage your ecommerce store with powerful tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {adminTools.map((tool) => {
            const Icon = tool.icon
            if (tool.disabled) {
              return (
                <div
                  key={tool.title}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-50 cursor-not-allowed text-center"
                  aria-disabled
                >
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">{tool.title}</span>
                  <p className="text-xs text-gray-300 mt-1">Coming Soon</p>
                </div>
              )
            }
            return (
              <Link
                key={tool.title}
                href={tool.href}
                prefetch
                className="group block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:border-transparent hover:-translate-y-1 text-center"
              >
                <div className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700" style={{ pointerEvents: 'none' }}>
                  {tool.title}
                </span>
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs text-gray-500">Click to manage →</span>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
