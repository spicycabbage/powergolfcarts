'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/admin/BackButton'
import { 
  Star, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Gift,
  TrendingUp,
  Users
} from 'lucide-react'

export default function LoyaltyPointsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session.user?.role !== 'admin') {
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Star className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Loyalty Points Management</h1>
            </div>
            <BackButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">Manage customer loyalty points and rewards program</p>
          <button
            disabled
            className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Reward (Coming Soon)
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points Issued</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loyalty Points System</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The loyalty points management system is coming soon. This will allow you to:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Set point earning rules for purchases
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Create reward tiers and benefits
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Track customer point balances
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Manage point redemptions
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                Generate loyalty program reports
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
