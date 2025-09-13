'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/admin/BackButton'
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, Filter } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'sales' | 'orders'>('sales')
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    content: string
  }>({ show: false, x: 0, y: 0, content: '' })

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

  const formatAxisLabel = (period: string, index: number) => {
    const date = new Date(period)
    switch (groupBy) {
      case 'day':
        return {
          day: date.getDate().toString(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          showMonth: index === 0 || (index > 0 && new Date(salesData[index - 1].period).getMonth() !== date.getMonth())
        }
      case 'week':
        return {
          day: `W${Math.ceil(date.getDate() / 7)}`,
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          showMonth: index === 0 || index % 4 === 0
        }
      case 'month':
        return {
          day: date.toLocaleDateString('en-US', { month: 'short' }),
          month: date.getFullYear().toString(),
          showMonth: true
        }
      default:
        return { day: period, month: '', showMonth: false }
    }
  }

  const getMaxSalesValue = () => {
    const maxValue = Math.max(...salesData.map(d => Math.max(d.completedSales, d.pendingSales)), 1)
    // Round up to nearest $100, max $1000
    return Math.min(Math.ceil(maxValue / 100) * 100, 1000)
  }

  const getMaxOrdersValue = () => {
    const maxValue = Math.max(...salesData.map(d => Math.max(d.completedOrders, d.pendingOrders)), 1)
    // Round up to nearest 5, max 50
    return Math.min(Math.ceil(maxValue / 5) * 5, 50)
  }

  const getSalesYAxisLabels = () => {
    const max = getMaxSalesValue()
    const increment = 100
    const labels = []
    for (let i = max; i >= 0; i -= increment) {
      labels.push(i)
    }
    return labels
  }

  const getOrdersYAxisLabels = () => {
    const max = getMaxOrdersValue()
    const increment = 5
    const labels = []
    for (let i = max; i >= 0; i -= increment) {
      labels.push(i)
    }
    return labels
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
            <BackButton />
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

        {/* Tabbed Chart Section */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'sales'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales Over Time
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders Over Time
            </button>
          </div>

          {/* Chart Content */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'sales' ? 'Sales Over Time' : 'Orders Over Time'}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === 'sales' 
                ? `Sales grouped by ${groupBy} for the ${dateRange === '7d' ? 'last 7 days' : 
                                                         dateRange === '30d' ? 'last 30 days' : 
                                                         dateRange === '90d' ? 'last 90 days' : 'last year'}`
                : `Number of orders by ${groupBy}`
              }
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
            <div className="h-96 relative">
              {/* Legend */}
              <div className="mb-4 flex justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {activeTab === 'sales' ? 'Completed Sales' : 'Completed Orders'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {activeTab === 'sales' ? 'Pending Sales' : 'Pending Orders'}
                  </span>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="relative h-80 border-l border-b border-gray-200 ml-12 mb-8">
                {/* Y-axis labels */}
                <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  {activeTab === 'sales' ? (
                    getSalesYAxisLabels().map((value, index) => (
                      <span key={index}>{formatCurrency(value)}</span>
                    ))
                  ) : (
                    getOrdersYAxisLabels().map((value, index) => (
                      <span key={index}>{value}</span>
                    ))
                  )}
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {activeTab === 'sales' ? (
                    getSalesYAxisLabels().map((value, index) => {
                      const ratio = value / getMaxSalesValue()
                      return (
                        <div
                          key={index}
                          className="absolute w-full border-t border-gray-100"
                          style={{ bottom: `${ratio * 100}%` }}
                        />
                      )
                    })
                  ) : (
                    getOrdersYAxisLabels().map((value, index) => {
                      const ratio = value / getMaxOrdersValue()
                      return (
                        <div
                          key={index}
                          className="absolute w-full border-t border-gray-100"
                          style={{ bottom: `${ratio * 100}%` }}
                        />
                      )
                    })
                  )}
                </div>
                
                {/* Chart SVG */}
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                  {/* Completed Line */}
                  <polyline
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    points={salesData.map((data, index) => {
                      const x = (index / (salesData.length - 1)) * 100
                      const maxValue = activeTab === 'sales' ? getMaxSalesValue() : getMaxOrdersValue()
                      const value = activeTab === 'sales' ? data.completedSales : data.completedOrders
                      const y = 100 - (value / maxValue) * 100
                      return `${x}%,${y}%`
                    }).join(' ')}
                  />
                  
                  {/* Pending Line */}
                  <polyline
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="2"
                    points={salesData.map((data, index) => {
                      const x = (index / (salesData.length - 1)) * 100
                      const maxValue = activeTab === 'sales' ? getMaxSalesValue() : getMaxOrdersValue()
                      const value = activeTab === 'sales' ? data.pendingSales : data.pendingOrders
                      const y = 100 - (value / maxValue) * 100
                      return `${x}%,${y}%`
                    }).join(' ')}
                  />
                  
                  {/* Data Points */}
                  {salesData.map((data, index) => {
                    const x = (index / (salesData.length - 1)) * 100
                    const maxValue = activeTab === 'sales' ? getMaxSalesValue() : getMaxOrdersValue()
                    const completedValue = activeTab === 'sales' ? data.completedSales : data.completedOrders
                    const pendingValue = activeTab === 'sales' ? data.pendingSales : data.pendingOrders
                    const completedY = 100 - (completedValue / maxValue) * 100
                    const pendingY = 100 - (pendingValue / maxValue) * 100
                    
                    return (
                      <g key={index}>
                        {/* Completed Dot */}
                        <circle
                          cx={`${x}%`}
                          cy={`${completedY}%`}
                          r="4"
                          fill="#16a34a"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-6 transition-all"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const content = activeTab === 'sales' 
                              ? `${formatPeriod(data.period)} - Completed: ${formatCurrency(data.completedSales)} (${data.completedOrders} orders)`
                              : `${formatPeriod(data.period)} - Completed: ${data.completedOrders} orders`
                            setTooltip({
                              show: true,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10,
                              content
                            })
                          }}
                          onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, content: '' })}
                        />
                        
                        {/* Pending Dot */}
                        <circle
                          cx={`${x}%`}
                          cy={`${pendingY}%`}
                          r="4"
                          fill="#ea580c"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-6 transition-all"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const content = activeTab === 'sales' 
                              ? `${formatPeriod(data.period)} - Pending: ${formatCurrency(data.pendingSales)} (${data.pendingOrders} orders)`
                              : `${formatPeriod(data.period)} - Pending: ${data.pendingOrders} orders`
                            setTooltip({
                              show: true,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10,
                              content
                            })
                          }}
                          onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, content: '' })}
                        />
                      </g>
                    )
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0">
                  {salesData.map((data, index) => {
                    const x = (index / (salesData.length - 1)) * 100
                    const labelInfo = formatAxisLabel(data.period, index)
                    return (
                      <div 
                        key={index} 
                        className="absolute text-xs text-gray-500 transform -translate-x-1/2 text-center"
                        style={{ left: `${x}%` }}
                      >
                        <div className="font-medium">{labelInfo.day}</div>
                        {labelInfo.showMonth && (
                          <div className="text-gray-400 mt-0.5">{labelInfo.month}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Custom Tooltip */}
          {tooltip.show && (
            <div
              className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              {tooltip.content}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
