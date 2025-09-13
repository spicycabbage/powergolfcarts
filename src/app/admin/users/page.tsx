'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react'
import { BackButton } from '@/components/admin/BackButton'
import Pagination from '@/components/admin/Pagination'

interface UserData {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'admin'
  isActive: boolean
  createdAt: string
  lastLogin?: string
  orders: Array<{
    _id: string
    invoiceNumber?: number
    total: number
    status: string
    createdAt: string
  }>
  totalOrderValue: number // Only completed orders
  completedOrderCount: number // Only completed orders
}

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
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

  // Fetch users
  useEffect(() => {
    if (isChecking) return
    
    let mounted = true
    const controller = new AbortController()
    
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        
        if (debouncedSearch) params.append('search', debouncedSearch)
        if (roleFilter !== 'all') params.append('role', roleFilter)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const response = await fetch(`/api/admin/users?${params}`, {
          signal: controller.signal,
          cache: 'no-store'
        })
        
        if (!response.ok) throw new Error('Failed to fetch users')
        
        const data = await response.json()
        
        if (mounted && data.success) {
          setUsers(data.data || [])
          setTotalPages(data.pagination?.totalPages || 1)
          setTotal(data.pagination?.total || 0)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to fetch users:', error)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    fetchUsers()
    
    return () => {
      mounted = false
      controller.abort()
    }
  }, [page, limit, debouncedSearch, roleFilter, statusFilter, isChecking])

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected user(s)? This action cannot be undone.`)) return
    
    try {
      setLoading(true)
      for (const id of selectedIds) {
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      }
      setSelectedIds([])
      // Refresh the list
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' })
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Failed to delete users:', error)
      alert('Failed to delete some users')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user management...</p>
        </div>
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
              <Eye className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            </div>
            <BackButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                />
              </div>
              
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="admin">Admins</option>
              </select>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Delete Button */}
            <button
              disabled={selectedIds.length === 0}
              onClick={handleDeleteSelected}
              className={`px-4 py-2 rounded-lg border ${
                selectedIds.length === 0 
                  ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'text-red-600 border-red-300 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Top Pagination */}
        {totalPages > 1 && (
          <div className="mb-6 flex justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedIds.length > 0 && selectedIds.length === users.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(users.map(u => u._id))
                          } else {
                            setSelectedIds([])
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lifetime Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedIds.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, user._id])
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== user._id))
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {user.orders.filter(order => order.status === 'completed').slice(0, 3).map((order, index) => (
                            <div key={order._id} className="flex justify-between items-center mb-1">
                              <span className="text-gray-600">#{order.invoiceNumber || 'N/A'}</span>
                              <span className="font-medium">{formatCurrency(order.total)}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          ))}
                          {user.orders.filter(order => order.status === 'completed').length === 0 && (
                            <span className="text-gray-400 text-sm">No completed orders</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(user.totalOrderValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.completedOrderCount} completed order{user.completedOrderCount !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </div>
    </div>
  )
}
