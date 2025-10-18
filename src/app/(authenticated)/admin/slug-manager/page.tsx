'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Check, X, AlertTriangle } from 'lucide-react'

interface SlugIssue {
  _id: string
  name: string
  currentSlug: string
  expectedSlug: string
  isActive: boolean
}

export default function SlugManagerPage() {
  const { data: session, status } = useSession()
  const [issues, setIssues] = useState<SlugIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string[]>([])
  const [message, setMessage] = useState('')

  // Redirect if not admin
  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  }

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin')
  }

  useEffect(() => {
    fetchSlugIssues()
  }, [])

  const fetchSlugIssues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/slug-issues')
      const data = await response.json()
      
      if (data.success) {
        setIssues(data.issues || [])
      } else {
        setMessage('Failed to load slug issues')
      }
    } catch (error) {
      setMessage('Error loading slug issues')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSlug = async (productId: string, newSlug: string) => {
    try {
      setUpdating(prev => [...prev, productId])
      
      const response = await fetch('/api/admin/update-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newSlug })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Updated slug successfully`)
        // Remove from issues list
        setIssues(prev => prev.filter(issue => issue._id !== productId))
      } else {
        setMessage(`❌ Failed to update slug: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error updating slug')
      console.error('Error:', error)
    } finally {
      setUpdating(prev => prev.filter(id => id !== productId))
    }
  }

  const updateAllSlugs = async () => {
    if (!confirm(`Update ${issues.length} product slugs?`)) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/admin/update-all-slugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Updated ${data.updated} slugs successfully`)
        setIssues([])
      } else {
        setMessage(`❌ Failed to update slugs: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error updating slugs')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Slug Manager</h1>
            </div>
            <button
              onClick={fetchSlugIssues}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Analyzing product slugs...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">All Slugs Look Good!</h2>
            <p className="text-gray-600">No problematic product slugs found.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Found {issues.length} Slug Issues
                    </h2>
                    <p className="text-gray-600">
                      These products have slugs that don't match their names
                    </p>
                  </div>
                </div>
                <button
                  onClick={updateAllSlugs}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Fix All Slugs
                </button>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Product Slug Issues</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <div key={issue._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{issue.name}</h4>
                          {issue.isActive ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Inactive</span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Current:</span>
                            <code className="px-2 py-1 bg-red-50 text-red-700 rounded">{issue.currentSlug}</code>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Expected:</span>
                            <code className="px-2 py-1 bg-green-50 text-green-700 rounded">{issue.expectedSlug}</code>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => updateSlug(issue._id, issue.expectedSlug)}
                        disabled={updating.includes(issue._id)}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating.includes(issue._id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Fix'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
