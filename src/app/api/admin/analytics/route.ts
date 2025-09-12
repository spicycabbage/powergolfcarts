import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { connectToDatabase } from '@/lib/mongodb'
import Order from '@/lib/models/Order'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const groupBy = searchParams.get('groupBy') || 'day'
    const dateRange = searchParams.get('dateRange') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get both completed and pending orders in date range
    const completedOrders = await Order.find({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: now }
    })
    .select('total createdAt status')
    .sort({ createdAt: 1 })
    .lean()

    const pendingOrders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] },
      createdAt: { $gte: startDate, $lte: now }
    })
    .select('total createdAt status')
    .sort({ createdAt: 1 })
    .lean()

    // Group data by period
    const groupedData = new Map()
    
    // Process completed orders
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt)
      let periodKey: string
      
      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'week':
          // Get Monday of the week
          const monday = new Date(date)
          monday.setDate(date.getDate() - date.getDay() + 1)
          periodKey = monday.toISOString().split('T')[0]
          break
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
          break
        default:
          periodKey = date.toISOString().split('T')[0]
      }
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          period: periodKey,
          completedSales: 0,
          completedOrders: 0,
          pendingSales: 0,
          pendingOrders: 0,
          totalSales: 0,
          totalOrders: 0,
          avgOrderValue: 0
        })
      }
      
      const existing = groupedData.get(periodKey)
      existing.completedSales += order.total
      existing.completedOrders += 1
      existing.totalSales += order.total
      existing.totalOrders += 1
    })

    // Process pending orders
    pendingOrders.forEach(order => {
      const date = new Date(order.createdAt)
      let periodKey: string
      
      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'week':
          // Get Monday of the week
          const monday = new Date(date)
          monday.setDate(date.getDate() - date.getDay() + 1)
          periodKey = monday.toISOString().split('T')[0]
          break
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
          break
        default:
          periodKey = date.toISOString().split('T')[0]
      }
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          period: periodKey,
          completedSales: 0,
          completedOrders: 0,
          pendingSales: 0,
          pendingOrders: 0,
          totalSales: 0,
          totalOrders: 0,
          avgOrderValue: 0
        })
      }
      
      const existing = groupedData.get(periodKey)
      existing.pendingSales += order.total
      existing.pendingOrders += 1
      existing.totalSales += order.total
      existing.totalOrders += 1
    })

    // Calculate average order values and convert to array
    const salesData = Array.from(groupedData.values()).map(data => ({
      ...data,
      avgOrderValue: data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0
    }))

    // Fill in missing periods with zero values
    const filledData = fillMissingPeriods(salesData, startDate, now, groupBy)

    // Calculate overall stats
    const totalCompletedSales = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const totalPendingSales = pendingOrders.reduce((sum, order) => sum + order.total, 0)
    const totalSales = totalCompletedSales + totalPendingSales
    const totalCompletedOrders = completedOrders.length
    const totalPendingOrders = pendingOrders.length
    const totalOrders = totalCompletedOrders + totalPendingOrders
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate)
    const periodLength = now.getTime() - startDate.getTime()
    previousPeriodStart.setTime(startDate.getTime() - periodLength)

    const previousCompletedOrders = await Order.find({
      status: 'completed',
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    })
    .select('total')
    .lean()

    const previousTotalSales = previousCompletedOrders.reduce((sum, order) => sum + order.total, 0)
    const previousTotalOrders = previousCompletedOrders.length

    const salesGrowth = previousTotalSales > 0 
      ? ((totalCompletedSales - previousTotalSales) / previousTotalSales) * 100 
      : 0
    const ordersGrowth = previousTotalOrders > 0 
      ? ((totalCompletedOrders - previousTotalOrders) / previousTotalOrders) * 100 
      : 0

    const stats = {
      totalSales: totalCompletedSales, // Only completed sales for main stats
      totalOrders: totalCompletedOrders, // Only completed orders for main stats
      totalPendingSales,
      totalPendingOrders,
      avgOrderValue,
      salesGrowth,
      ordersGrowth
    }

    return NextResponse.json({
      success: true,
      salesData: filledData,
      stats
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function fillMissingPeriods(
  data: any[], 
  startDate: Date, 
  endDate: Date, 
  groupBy: string
): any[] {
  const filledData = []
  const dataMap = new Map(data.map(d => [d.period, d]))
  
  const current = new Date(startDate)
  
  while (current <= endDate) {
    let periodKey: string
    
    switch (groupBy) {
      case 'day':
        periodKey = current.toISOString().split('T')[0]
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        // Get Monday of the week
        const monday = new Date(current)
        monday.setDate(current.getDate() - current.getDay() + 1)
        periodKey = monday.toISOString().split('T')[0]
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-01`
        current.setMonth(current.getMonth() + 1)
        break
      default:
        periodKey = current.toISOString().split('T')[0]
        current.setDate(current.getDate() + 1)
    }
    
    if (dataMap.has(periodKey)) {
      filledData.push(dataMap.get(periodKey))
    } else {
      filledData.push({
        period: periodKey,
        completedSales: 0,
        completedOrders: 0,
        pendingSales: 0,
        pendingOrders: 0,
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0
      })
    }
  }
  
  return filledData
}
