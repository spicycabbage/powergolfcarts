'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, Filter } from 'lucide-react'
import BackToAdmin from '@/components/admin/BackToAdmin'

interface SalesData {
  period: string
  completedSales: number
  completedOrders: number
  pendingSales: number
  pendingOrders: number
  totalSales: number
  totalOrders: number
  avgOrderValue: number
}

interface AnalyticsStats {
  totalSales: number
  totalOrders: number
  totalPendingSales: number
  totalPendingOrders: number
  avgOrderValue: number
  salesGrowth: number
  ordersGrowth: number
}

type GroupBy = 'day' | 'week' | 'month'
type DateRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [stats, setStats] = useState<AnalyticsStats>({
    totalSales: 0,
    totalOrders: 0,
    totalPendingSales: 0,
    totalPendingOrders: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [dateRange, setDateRange] = useState<DateRange>('30d')

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

  // Fetch analytics data
  useEffect(() => {
    if (isChecking) return
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/analytics?groupBy=${groupBy}&dateRange=${dateRange}`, {
          cache: 'no-store'
        })
        
        if (!response.ok) throw new Error('Failed to fetch analytics')
        
        const data = await response.json()
        
        if (data.success) {
          setSalesData(data.salesData || [])
          setStats(data.stats || stats)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [groupBy, dateRange, isChecking])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPeriod = (period: string) => {
    const date = new Date(period)
    
    switch (groupBy) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'week':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      default:
        return period
    }
  }

  const getMaxSalesValue = () => {
    return Math.max(...salesData.map(d => Math.max(d.completedSales, d.pendingSales)), 1)
  }

  const getMaxOrdersValue = () => {
    return Math.max(...salesData.map(d => Math.max(d.completedOrders, d.pendingOrders)), 1)
  }

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
              <BarChart3 className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Sales Analytics</h1>
            </div>
            <BackToAdmin label="Back to Admin" href="/admin" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Group By */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Group by:</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[100px] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="day">Days</option>
                  <option value="week">Weeks</option>
                  <option value="month">Months</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px] appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalSales)}</p>
                {stats.salesGrowth !== 0 && (
                  <p className={`text-sm ${stats.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.salesGrowth > 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}% from previous period
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                {stats.ordersGrowth !== 0 && (
                  <p className={`text-sm ${stats.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.ordersGrowth > 0 ? '+' : ''}{stats.ordersGrowth.toFixed(1)}% from previous period
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPendingOrders.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{formatCurrency(stats.totalPendingSales)} value</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Data Points</p>
                <p className="text-2xl font-semibold text-gray-900">{salesData.length}</p>
                <p className="text-sm text-gray-500">
                  {groupBy === 'day' ? 'Days' : groupBy === 'week' ? 'Weeks' : 'Months'} analyzed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sales Over Time</h2>
            <p className="text-sm text-gray-500">
              Sales grouped by {groupBy} for the {dateRange === '7d' ? 'last 7 days' : 
                                                   dateRange === '30d' ? 'last 30 days' : 
                                                   dateRange === '90d' ? 'last 90 days' : 'last year'}
            </p>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading chart data...</p>
              </div>
            </div>
          ) : salesData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No sales data available</p>
                <p className="text-sm">Try selecting a different date range or check back later.</p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              {/* Dual Line Chart */}
              <div className="mb-4 flex justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Completed Orders</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Pending Orders</span>
                </div>
              </div>
              <div className="h-full flex items-end justify-between gap-2 px-4">
                {salesData.map((data, index) => {
                  const completedHeight = (data.completedSales / getMaxSalesValue()) * 100
                  const pendingHeight = (data.pendingSales / getMaxSalesValue()) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-center gap-1 mb-2">
                        {/* Completed Sales Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs font-medium text-green-700 mb-1">
                            {data.completedSales > 0 ? formatCurrency(data.completedSales) : ''}
                          </div>
                          <div
                            className="w-full bg-green-600 rounded-t-sm hover:bg-green-700 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(completedHeight, 2)}%` }}
                            title={`${formatPeriod(data.period)} - Completed: ${formatCurrency(data.completedSales)} (${data.completedOrders} orders)`}
                          />
                        </div>
                        {/* Pending Sales Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs font-medium text-orange-700 mb-1">
                            {data.pendingSales > 0 ? formatCurrency(data.pendingSales) : ''}
                          </div>
                          <div
                            className="w-full bg-orange-600 rounded-t-sm hover:bg-orange-700 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(pendingHeight, 2)}%` }}
                            title={`${formatPeriod(data.period)} - Pending: ${formatCurrency(data.pendingSales)} (${data.pendingOrders} orders)`}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center transform -rotate-45 origin-center mt-2">
                        {formatPeriod(data.period)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Orders Over Time</h2>
            <p className="text-sm text-gray-500">Number of orders by {groupBy}</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : salesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          ) : (
            <div className="h-64">
              <div className="mb-4 flex justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Completed Orders</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Pending Orders</span>
                </div>
              </div>
              <div className="h-full flex items-end justify-between gap-2 px-4">
                {salesData.map((data, index) => {
                  const completedHeight = (data.completedOrders / getMaxOrdersValue()) * 100
                  const pendingHeight = (data.pendingOrders / getMaxOrdersValue()) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-center gap-1 mb-2">
                        {/* Completed Orders Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs font-medium text-green-700 mb-1">
                            {data.completedOrders > 0 ? data.completedOrders : ''}
                          </div>
                          <div
                            className="w-full bg-green-600 rounded-t-sm hover:bg-green-700 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(completedHeight, 2)}%` }}
                            title={`${formatPeriod(data.period)} - Completed: ${data.completedOrders} orders`}
                          />
                        </div>
                        {/* Pending Orders Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs font-medium text-orange-700 mb-1">
                            {data.pendingOrders > 0 ? data.pendingOrders : ''}
                          </div>
                          <div
                            className="w-full bg-orange-600 rounded-t-sm hover:bg-orange-700 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(pendingHeight, 2)}%` }}
                            title={`${formatPeriod(data.period)} - Pending: ${data.pendingOrders} orders`}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center transform -rotate-45 origin-center mt-2">
                        {formatPeriod(data.period)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
