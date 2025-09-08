"use client"
import { useState } from 'react'
import BackToAdmin from '@/components/admin/BackToAdmin'

interface Method {
  _id?: string
  name: string
  price: number
  freeThreshold?: number
  sortOrder?: number
  isActive: boolean
}

export default function ShippingAdminClient({ initial }: { initial: { freeShippingThreshold: number, methods: Method[] } }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freeThreshold, setFreeThreshold] = useState(initial.freeShippingThreshold)
  const [methods, setMethods] = useState<Method[]>(initial.methods || [])

  const addMethod = () => {
    setMethods(prev => ([...prev, { name: 'New Method', price: 0, isActive: true, sortOrder: (prev[prev.length-1]?.sortOrder || 0) + 1 } as any]))
  }

  const removeMethod = (idx: number) => {
    setMethods(prev => prev.filter((_, i) => i !== idx))
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeShippingThreshold: freeThreshold, methods })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to save')
      alert('Shipping settings saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Shipping Settings</h1>
            <BackToAdmin />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Removed global free threshold per request; per-method freeThreshold is used */}

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Shipping Methods</h2>
            <button onClick={addMethod} className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Method</button>
          </div>
          <div className="space-y-4">
            {methods.map((m, i) => (
              <div key={m._id || i} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => setMethods(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={m.price}
                      onChange={(e) => setMethods(prev => prev.map((x, idx) => idx === i ? { ...x, price: Math.max(0, Number(e.target.value)) } : x))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Free ≥ ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={m.freeThreshold ?? ''}
                      onChange={(e) => setMethods(prev => prev.map((x, idx) => idx === i ? { ...x, freeThreshold: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) } : x))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      placeholder="optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Sort</label>
                    <input
                      type="number"
                      min={1}
                      value={m.sortOrder ?? 1}
                      onChange={(e) => {
                        const next = Math.max(1, Number(e.target.value) || 1)
                        setMethods(prev => prev.map((x, idx) => idx === i ? { ...x, sortOrder: next } : x))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Active</label>
                    <select
                      value={m.isActive ? 'true' : 'false'}
                      onChange={(e) => setMethods(prev => prev.map((x, idx) => idx === i ? { ...x, isActive: e.target.value === 'true' } : x))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  {/* Removed description field */}
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => removeMethod(i)} className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}


