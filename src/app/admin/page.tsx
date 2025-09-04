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
import Image from 'next/image'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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
        const res = await fetch(`/api/products?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json().catch(() => ({} as any))
        if (mounted) {
          setRecentProducts(Array.isArray(json?.data) ? json.data : [])
          const pag = json?.pagination || {}
          setTotalPages(pag.totalPages || 1)
          setTotal(pag.total || 0)
        }
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    })()
    return () => { mounted = false }
  }, [page])

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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
            <button
              disabled={selectedIds.length === 0}
              onClick={async () => {
                if (selectedIds.length === 0) return
                if (!confirm(`Delete ${selectedIds.length} selected item(s)?`)) return
                try {
                  for (const id of selectedIds) {
                    await fetch(`/api/products/${id}`, { method: 'DELETE' })
                  }
                  // refresh list
                  setSelectedIds([])
                  setLoadingProducts(true)
                  const res = await fetch(`/api/products?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' })
                  const json = await res.json().catch(() => ({} as any))
                  setRecentProducts(Array.isArray(json?.data) ? json.data : [])
                  const pag = json?.pagination || {}
                  setTotalPages(pag.totalPages || 1)
                  setTotal(pag.total || 0)
                } catch {}
                finally {
                  setLoadingProducts(false)
                }
              }}
              className={`px-4 py-2 rounded-lg border ${selectedIds.length === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-red-600 border-red-300 hover:bg-red-50'}`}
            >
              Delete
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loadingProducts ? (
              <div className="p-6 text-gray-600">Loading…</div>
            ) : recentProducts.length === 0 ? (
              <div className="p-6 text-gray-600">No products yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedIds.length > 0 && selectedIds.length === recentProducts.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(recentProducts.map((p: any) => p._id))
                              else setSelectedIds([])
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Published</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentProducts.map((p: any) => (
                        <tr key={p._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={selectedIds.includes(p._id)}
                              onChange={(e) => {
                                setSelectedIds(prev => e.target.checked ? [...prev, p._id] : prev.filter(id => id !== p._id))
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {Array.isArray(p.images) && p.images.length > 0 ? (
                              <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100">
                                <Image
                                  src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0]?.url || '/placeholder-product.jpg')}
                                  alt={typeof p.images[0] === 'string' ? p.name : (p.images[0]?.alt || p.name)}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-100" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <Link href={`/products/${p.slug}`} className="text-primary-600 hover:text-primary-700">{p.name}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${Number(p.price || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p?.inventory?.quantity ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p?.category?.name || ''}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                            {Array.isArray(p?.tags) && p.tags.length > 0 ? p.tags.join(', ') : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {p.isFeatured ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-50 text-yellow-700">Yes</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages} • {total} total
                  </div>
                  <div className="inline-flex items-center space-x-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={`px-3 py-2 text-sm rounded-lg border ${page <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      Prev
                    </button>
                    <div className="hidden sm:flex items-center space-x-1">
                      {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`px-3 py-2 text-sm rounded-lg border ${page === i + 1 ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={`px-3 py-2 text-sm rounded-lg border ${page >= totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
