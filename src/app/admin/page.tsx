'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Folder, 
  Upload,
  BarChart3,
  Users,
  Package
} from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

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
      description: 'Edit header, secondary navigation, and primary navigation',
      icon: Settings,
      href: '/admin/navigation',
      color: 'bg-blue-500'
    },
    {
      title: 'Category Management',
      description: 'Create and manage product categories and subcategories',
      icon: Folder,
      href: '/admin/categories',
      color: 'bg-green-500'
    },
    {
      title: 'Product Import',
      description: 'Import products from CSV files',
      icon: Upload,
      href: '/admin/products/import',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View sales reports and analytics (Coming Soon)',
      icon: BarChart3,
      href: '#',
      color: 'bg-orange-500',
      disabled: true
    },
    {
      title: 'User Management',
      description: 'Manage customer accounts (Coming Soon)',
      icon: Users,
      href: '#',
      color: 'bg-red-500',
      disabled: true
    },
    {
      title: 'Product Management',
      description: 'Manage individual products (Coming Soon)',
      icon: Package,
      href: '#',
      color: 'bg-indigo-500',
      disabled: true
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
              Welcome, {session.user?.name}
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
            return (
              <div
                key={tool.title}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 ${
                  tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
                onClick={() => !tool.disabled && router.push(tool.href)}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${tool.color} text-white mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                    {tool.disabled && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => router.push('/admin/categories')}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Set Up Categories</h4>
                <p className="text-sm text-gray-600">Create product categories before importing products</p>
              </button>
              
              <button
                onClick={() => router.push('/admin/navigation')}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Customize Navigation</h4>
                <p className="text-sm text-gray-600">Edit your site's header and navigation menus</p>
              </button>
              
              <button
                onClick={() => router.push('/admin/products/import')}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Import Products</h4>
                <p className="text-sm text-gray-600">Upload your product catalog via CSV</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
