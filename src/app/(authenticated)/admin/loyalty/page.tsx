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
import AdjustPoints from './AdjustPoints'

export default function LoyaltyPointsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<'settings'|'customers'>('settings')
  const [pointsPerDollar, setPointsPerDollar] = useState<number>(1)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

  // Removed early return to keep hooks order consistent

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/admin/loyalty/config', { cache: 'no-store' })
        const j = await r.json()
        if (j?.success) setPointsPerDollar(Number(j.data?.pointsPerDollar ?? 1))
      } catch {}
    })()
  }, [])

  const saveConfig = async () => {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/loyalty/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pointsPerDollar }) })
      const j = await r.json()
      if (!j?.success) alert(j?.error || 'Failed to save')
    } catch { alert('Failed to save') } finally { setSaving(false) }
  }

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', ...(q ? { q } : {}) })
      const r = await fetch(`/api/admin/loyalty/users?${params.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (j?.success) { setUsers(j.data || []); setTotalPages(j.pagination?.totalPages || 1) }
    } catch {}
  }
  useEffect(() => { if (tab === 'customers') void loadUsers() }, [tab, page, q])

  return (
    <div className="min-h-screen bg-gray-50">
      {(status === 'loading' || isLoading) ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
      <>
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
        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border overflow-hidden">
            <button onClick={()=>setTab('settings')} className={`px-4 py-2 text-sm ${tab==='settings'?'bg-primary-600 text-white':'bg-white text-gray-700'}`}>Settings</button>
            <button onClick={()=>setTab('customers')} className={`px-4 py-2 text-sm ${tab==='customers'?'bg-primary-600 text-white':'bg-white text-gray-700'}`}>Customers</button>
          </div>
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

        {/* Content */}
        {tab==='settings' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earning Settings</h3>
            <label className="block text-sm text-gray-700 mb-1">Points per $1 spent</label>
            <div className="flex items-center gap-2">
              <input type="number" min={0} step={0.1} value={pointsPerDollar} onChange={(e)=>setPointsPerDollar(Number(e.target.value))} className="px-3 py-2 border rounded-lg w-40" />
              <button onClick={saveConfig} disabled={saving} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">Save</button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Only awarded once when an order is first marked as Completed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input value={q} onChange={(e)=>{setQ(e.target.value); setPage(1)}} placeholder="Search by email" className="pl-10 pr-3 py-2 border rounded-lg w-64" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-right">Points</th>
                    <th className="px-4 py-2 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-2">
                        <button onClick={async()=>{ window.open(`/admin/loyalty/users/${u._id}`, '_blank', 'noopener,noreferrer') }} className="text-blue-600 hover:text-blue-700 underline">
                          {u.email}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button onClick={async()=>{ window.open(`/admin/loyalty/users/${u._id}`, '_blank', 'noopener,noreferrer') }} className="text-blue-600 hover:text-blue-700 underline">
                          {u.firstName} {u.lastName}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-right">{Number(u.loyaltyPoints||0).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">
                        <AdjustPoints userId={u._id} onDone={loadUsers} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-600">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
                    <button className="px-3 py-1 border rounded" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}
