'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const TZ = 'America/Los_Angeles'
  const formatDateTimeLocalInTZ = (date: Date, timeZone: string) => {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const parts = dtf.formatToParts(date).reduce((acc: any, p) => {
      acc[p.type] = p.value
      return acc
    }, {})
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
  }
  const parseDateTimeLocalInTZToDate = (input: string, timeZone: string) => {
    const [datePart, timePart] = input.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const [hh, mm] = timePart.split(':').map(Number)
    const utcMillis = Date.UTC(y, (m - 1), d, hh, mm)
    const ref = new Date(utcMillis)
    const tzDate = new Date(ref.toLocaleString('en-US', { timeZone }))
    const utcDate = new Date(ref.toLocaleString('en-US', { timeZone: 'UTC' }))
    const offset = tzDate.getTime() - utcDate.getTime()
    return new Date(utcMillis - offset)
  }
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    minimumOrderAmount: '',
    usageLimit: '',
    userUsageLimit: '',
    validFrom: formatDateTimeLocalInTZ(new Date(), TZ), // Current PST datetime
    validUntil: formatDateTimeLocalInTZ(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), TZ), // +30d PST
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.code, // Use code as name
          value: parseFloat(formData.value),
          minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : undefined,
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
        alert(error.message || 'Failed to create coupon')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert('Failed to create coupon')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/coupons"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Coupons
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Coupon</h1>
          <p className="mt-2 text-gray-600">Create a new discount coupon for your store</p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
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
                  required
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., SAVE20"
                />
                <p className="mt-1 text-sm text-gray-500">This is what customers will enter at checkout</p>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  required
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  max={formData.type === 'percentage' ? '100' : undefined}
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.type === 'percentage' ? 'Percentage off (0-100)' : 'Dollar amount off'}
                </p>
              </div>

              <div>
                <label htmlFor="minimumOrderAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="mt-1 text-sm text-gray-500">Optional minimum order value</p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional description for internal use"
              />
            </div>

            {/* Usage Limits */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Total Uses
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    min="1"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited uses</p>
                </div>

                <div>
                  <label htmlFor="userUsageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Uses Per User
                  </label>
                  <input
                    type="number"
                    id="userUsageLimit"
                    name="userUsageLimit"
                    min="1"
                    value={formData.userUsageLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited per user</p>
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
                    required
                    value={formData.validFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    required
                    value={formData.validUntil}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                {loading ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
