'use client'

import { useEffect, useState } from 'react'
import { BackButton } from '@/components/admin/BackButton'

export default function PaymentOptionsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [etransferEnabled, setEtransferEnabled] = useState(true)
  // Email field removed per request; include in instructions if needed
  const [etransferNote, setEtransferNote] = useState('Auto-deposit enabled. No security question required.')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/payment', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load settings')
      setEtransferEnabled(Boolean(json.data?.etransfer?.enabled))
      // No email input; ignore stored email
      setEtransferNote(String(json.data?.etransfer?.note || ''))
    } catch (e: any) {
      setError(e?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchData() }, [])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etransfer: { enabled: etransferEnabled, note: etransferNote }
        })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to save settings')
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Options</h1>
          <BackButton />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interac e-Transfer</h2>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={etransferEnabled} onChange={(e) => setEtransferEnabled(e.target.checked)} />
              <span className="text-sm text-gray-800">Enable e-Transfer</span>
            </label>

            {/* Email field intentionally removed */}

            <div>
              <label className="block text-sm text-gray-700 mb-1">Instructions / Note</label>
              <textarea
                value={etransferNote}
                onChange={(e) => setEtransferNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="pt-2">
              <button onClick={handleSave} disabled={loading} className={`px-4 py-2 bg-primary-600 text-white rounded-lg font-medium ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-700'}`}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


