'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Folder, 
  BarChart3,
  Users,
  Package
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/products?limit=10&sortBy=createdAt&sortOrder=desc', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json().catch(() => ({} as any))
        if (mounted) setRecentProducts(Array.isArray(json?.data) ? json.data : [])
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    })()
    return () => { mounted = false }
  }, [])

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
    // Removed Product Import per request
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
      title: 'Create Product',
      description: 'Add a new product with pricing, images, categories, and SEO',
      icon: Package,
      href: '/admin/products/new',
      color: 'bg-indigo-500',
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
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50 cursor-not-allowed`}
                  aria-disabled
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${tool.color} text-white mr-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{tool.description}</p>
                </div>
              )
            }
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className={`block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${tool.color} text-white mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </Link>
            )
          })}
        </div>

        {/* Recent Products */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Products</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loadingProducts ? (
              <div className="p-6 text-gray-600">Loading…</div>
            ) : recentProducts.length === 0 ? (
              <div className="p-6 text-gray-600">No products yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProducts.map((p: any) => (
                      <tr key={p._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${Number(p.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {p.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700">Visible</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">Hidden</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link href={`/products/${p.slug}`} className="text-primary-600 hover:text-primary-700">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
