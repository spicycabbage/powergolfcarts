'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'

interface CouponData {
  _id: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  usageLimit?: number
  usageCount: number
  userUsageLimit?: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdBy: {
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export default function EditCouponPage() {
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [coupon, setCoupon] = useState<CouponData | null>(null)
  const TZ = 'America/Los_Angeles'
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    userUsageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  })

  useEffect(() => {
    if (couponId) {
      fetchCoupon()
    }
  }, [couponId])

  const fetchCoupon = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/admin/coupons/${couponId}`)
      const data = await response.json()

      if (data.success) {
        const couponData = data.data
        setCoupon(couponData)
        
        // Convert dates to datetime-local format in PST
        const formatDateTimeLocalInTZ = (date: Date | string, timeZone: string) => {
          const d = new Date(date)
          const dtf = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })
          const parts = dtf.formatToParts(d).reduce((acc: any, p) => { acc[p.type] = p.value; return acc }, {})
          return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
        }
        const parseDateTimeLocalInTZToDate = (input: string, timeZone: string) => {
          const [datePart, timePart] = input.split('T')
          const [y, m, day] = datePart.split('-').map(Number)
          const [hh, mm] = timePart.split(':').map(Number)
          const utcMillis = Date.UTC(y, (m - 1), day, hh, mm)
          const ref = new Date(utcMillis)
          const tzDate = new Date(ref.toLocaleString('en-US', { timeZone }))
          const utcDate = new Date(ref.toLocaleString('en-US', { timeZone: 'UTC' }))
          const offset = tzDate.getTime() - utcDate.getTime()
          return new Date(utcMillis - offset)
        }
        const validFrom = formatDateTimeLocalInTZ(couponData.validFrom, TZ)
        const validUntil = formatDateTimeLocalInTZ(couponData.validUntil, TZ)
        
        setFormData({
          code: couponData.code,
          type: couponData.type,
          value: couponData.value.toString(),
          description: couponData.description || '',
          minimumOrderAmount: couponData.minimumOrderAmount?.toString() || '',
          maximumDiscountAmount: couponData.maximumDiscountAmount?.toString() || '',
          usageLimit: couponData.usageLimit?.toString() || '',
          userUsageLimit: couponData.userUsageLimit?.toString() || '',
          validFrom,
          validUntil,
          isActive: couponData.isActive
        })
      } else {
        alert('Failed to load coupon')
        router.push('/admin/coupons')
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      alert('Failed to load coupon')
      router.push('/admin/coupons')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.code, // Use code as name
          value: parseFloat(formData.value),
          minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
          maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : undefined,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
          userUsageLimit: formData.userUsageLimit ? parseInt(formData.userUsageLimit) : undefined,
          validFrom: parseDateTimeLocalInTZToDate(formData.validFrom, TZ),
          validUntil: parseDateTimeLocalInTZToDate(formData.validUntil, TZ)
        }),
      })

      if (response.ok) {
        router.push('/admin/coupons')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      alert('Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading coupon...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Coupon not found</p>
            <Link
              href="/admin/coupons"
              className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Coupons
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/coupons"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
          <p className="mt-2 text-gray-600">
            Update coupon details and settings
          </p>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{coupon.usageCount}</div>
              <div className="text-sm text-gray-600">Times Used</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : '∞'}
              </div>
              <div className="text-sm text-gray-600">Remaining Uses</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {coupon.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 uppercase"
                  placeholder="SAVE20"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  required
                />
              </div>

              <div>
                <label htmlFor="minimumOrderAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  value={formData.minimumOrderAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="50.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {formData.type === 'percentage' && (
              <div>
                <label htmlFor="maximumDiscountAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Amount
                </label>
                <input
                  type="number"
                  id="maximumDiscountAmount"
                  name="maximumDiscountAmount"
                  value={formData.maximumDiscountAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="100.00"
                  step="0.01"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum dollar amount that can be discounted (optional)
                </p>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of the coupon..."
              />
            </div>

            {/* Usage Limits */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="100"
                    min="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum number of times this coupon can be used (leave empty for unlimited)
                  </p>
                </div>

                <div>
                  <label htmlFor="userUsageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    id="userUsageLimit"
                    name="userUsageLimit"
                    value={formData.userUsageLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1"
                    min="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum uses per customer (leave empty for unlimited)
                  </p>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validity Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                    Valid From *
                  </label>
                  <input
                    type="datetime-local"
                    id="validFrom"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="datetime-local"
                    id="validUntil"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border-t pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active (coupon can be used immediately)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end space-x-3">
              <Link
                href="/admin/coupons"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
