'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, DollarSign, TrendingUp, Settings } from 'lucide-react'

interface Referral {
  _id: string
  referrer: {
    firstName: string
    lastName: string
    email: string
    referralCode: string
  }
  referred?: {
    firstName: string
    lastName: string
    email: string
  }
  referredEmail: string
  order: {
    invoiceNumber: string
    createdAt: string
    total: number
  }
  orderTotal: number // The actual amount spent (used for referral calculation)
  commissionAmount: number
  loyaltyPointsAwarded: number
  status: 'pending' | 'awarded' | 'cancelled'
  referralUsedAt: string
  awardedAt?: string
}

interface ReferralSettings {
  pointsPerDollarSpent: number
  minimumOrderAmount: number
  maxPointsPerReferral?: number
  linkExpiryDays: number
  isActive: boolean
  termsAndConditions: string
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [settings, setSettings] = useState<ReferralSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'referrals' | 'relationships' | 'settings'>('referrals')
  const [relationships, setRelationships] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchReferrals = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/admin/referrals?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/referrals/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch referral settings:', error)
    }
  }

  const updateSettings = async (updatedSettings: Partial<ReferralSettings>) => {
    setSettingsLoading(true)
    try {
      const response = await fetch('/api/admin/referrals/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchReferrals(), fetchSettings()])
      setLoading(false)
    }
    loadData()
  }, [page, statusFilter])

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      awarded: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const awardedReferrals = referrals.filter(r => r.status === 'awarded')
  const totalPointsAwarded = awardedReferrals.reduce((sum, r) => sum + r.loyaltyPointsAwarded, 0)
  const activeReferrals = awardedReferrals.length
  const totalOrderValue = awardedReferrals.reduce((sum, r) => sum + (r.orderTotal || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{activeReferrals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOrderValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Awarded</p>
                <p className="text-2xl font-bold text-gray-900">{totalPointsAwarded.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'referrals'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Referrals
              </button>
              <button
                onClick={() => setActiveTab('relationships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'relationships'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Relationships
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'referrals' ? (
              <>
                {/* Filters */}
                <div className="mb-6 flex items-center gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="awarded">Awarded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Referrals Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referrer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referred Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {referrals.map((referral) => (
                        <tr key={referral._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {referral.referrer.firstName} {referral.referrer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {referral.referrer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                Code: {referral.referrer.referralCode}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {referral.referred ? (
                                <>
                                  <div className="text-sm font-medium text-gray-900">
                                    {referral.referred.firstName} {referral.referred.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {referral.referred.email}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  {referral.referredEmail}
                                  <div className="text-xs text-gray-400">(Guest)</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{referral.order.invoiceNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(referral.orderTotal)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(referral.orderTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.loyaltyPointsAwarded.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(referral.referralUsedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : activeTab === 'relationships' ? (
              /* Relationships Tab */
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Permanent Referral Relationships</h3>
                <p className="text-gray-600 mb-6">
                  These are permanent relationships where the referrer earns points for ALL future orders by the referred user.
                </p>
                
                {/* Relationships will be loaded here - for now showing placeholder */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Relationships Management</h4>
                  <p className="text-gray-600 mb-4">
                    View and manage permanent referral relationships between users.
                  </p>
                  <p className="text-sm text-gray-500">
                    This feature will show all active referral relationships and allow you to activate/deactivate them.
                  </p>
                </div>
              </div>
            ) : (
              /* Settings Tab */
              <div className="max-w-2xl">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Referral Settings</h3>
                
                {settings && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points per Dollar Spent by Referee
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={settings.pointsPerDollarSpent}
                          onChange={(e) => setSettings({...settings, pointsPerDollarSpent: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Referrer gets this many loyalty points per dollar spent by referee
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Order Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={settings.minimumOrderAmount}
                          onChange={(e) => setSettings({...settings, minimumOrderAmount: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Points per Referral
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={settings.maxPointsPerReferral || ''}
                          onChange={(e) => setSettings({...settings, maxPointsPerReferral: e.target.value ? Number(e.target.value) : undefined})}
                          placeholder="No limit"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={settings.isActive}
                        onChange={(e) => setSettings({...settings, isActive: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Enable referral system
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Terms and Conditions
                      </label>
                      <textarea
                        rows={4}
                        value={settings.termsAndConditions}
                        onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <button
                      onClick={() => updateSettings(settings)}
                      disabled={settingsLoading}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {settingsLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
