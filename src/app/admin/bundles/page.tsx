'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'
import { Plus, Edit, Eye, Package } from 'lucide-react'

interface Bundle {
  _id: string
  name: string
  slug: string
  description: string
  image: string
  requiredQuantity: number
  discountPercentage: number
  skuFilter: string
  category: string
  size: string
  isActive: boolean
  sortOrder: number
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      const response = await fetch('/api/bundles')
      if (!response.ok) {
        throw new Error('Failed to fetch bundles')
      }
      const data = await response.json()
      setBundles(data)
    } catch (error) {
      console.error('Error fetching bundles:', error)
      setError('Failed to load bundles')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-32 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bundle Management</h1>
            <p className="text-gray-600 mt-2">Manage bundle categories, images, and settings</p>
          </div>
          <Link
            href="/admin/bundles/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Bundle</span>
          </Link>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div key={bundle._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Bundle Image */}
              <div className="relative h-48 bg-gray-200">
                {bundle.image ? (
                  <OptimizedImage
                    src={bundle.image}
                    alt={bundle.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                      <p className="text-primary-700 font-medium">{bundle.category.toUpperCase()}</p>
                      <p className="text-primary-600 text-sm">{bundle.size}</p>
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bundle.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bundle.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {bundle.discountPercentage}% OFF
                </div>
              </div>

              {/* Bundle Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{bundle.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                
                {/* Bundle Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Required Items:</span>
                    <span className="font-medium">{bundle.requiredQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">SKU Filter:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{bundle.skuFilter}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sort Order:</span>
                    <span className="font-medium">{bundle.sortOrder}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/bundles/${bundle.slug}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </Link>
                  <Link
                    href={`/admin/bundles/${bundle._id}/edit`}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-primary-700 transition-colors text-center flex items-center justify-center space-x-1"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {bundles.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first bundle.</p>
            <Link
              href="/admin/bundles/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Bundle</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

