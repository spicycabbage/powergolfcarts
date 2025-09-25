'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Share2, Copy, Check, DollarSign, Star, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Referral {
  _id: string
  referred?: {
    firstName: string
    lastName: string
  }
  referredEmail: string
  order: {
    invoiceNumber: string
    createdAt: string
    total: number
  }
  commissionAmount: number
  loyaltyPointsAwarded: number
  status: 'pending' | 'awarded' | 'cancelled'
  referralUsedAt: string
  awardedAt?: string
}

interface ReferralStats {
  totalReferrals: number
  totalPointsEarned: number
  activeReferrals: number
}

export default function CustomerReferralsPage() {
  const { data: session } = useSession()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`/api/referrals/my-referrals?page=${page}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.data.referrals || [])
        setStats(data.data.stats)
        setReferralCode(data.data.referralCode)
        setTotalPages(data.data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralCode = async () => {
    try {
      const response = await fetch('/api/referrals/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralCode(data.referralCode)
      }
    } catch (error) {
      toast.error('Failed to load referral code')
    }
  }

  const getReferralUrl = () => {
    if (!referralCode) return window.location.origin
    return `${window.location.origin}?ref=${referralCode}`
  }

  const copyReferralLink = async () => {
    const url = getReferralUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const shareReferralLink = async () => {
    const url = getReferralUrl()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this great store!',
          text: 'I found this amazing store with great products. Use my referral link to get started!',
          url: url,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyReferralLink()
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchReferrals()
    }
  }, [session, page])

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

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your referrals</p>
          <Link href="/auth/login" className="bg-primary-600 text-white px-6 py-2 rounded-lg">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/account"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Account
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Referrals</h1>
          <p className="text-gray-600 mt-2">
            Share products with friends and earn loyalty points when they make purchases!
          </p>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
          
          {referralCode ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your referral code:</p>
                <p className="font-mono font-semibold text-primary-600 text-lg">{referralCode}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={getReferralUrl()}
                    readOnly
                    className="flex-1 bg-white border rounded px-3 py-2 text-sm text-gray-700"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={shareReferralLink}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Loading your referral code...</p>
              <button
                onClick={fetchReferralCode}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Reload Referral Code
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeReferrals}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPointsEarned.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Referral History</h3>
          </div>
          
          <div className="overflow-x-auto">
            {referrals.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points Earned
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
                          {referral.referred ? (
                            <div className="text-sm font-medium text-gray-900">
                              {referral.referred.firstName} {referral.referred.lastName}
                            </div>
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
                            {formatCurrency(referral.order.total)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(referral.order.total)}
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
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No referrals yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Share your referral link to start earning rewards!
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
        </div>
      </div>
    </div>
  )
}
