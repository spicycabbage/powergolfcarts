'use client'
import { useState, useMemo } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSend = useMemo(() => {
    const hasEmail = /.+@.+\..+/.test(email)
    return name.trim() && hasEmail && message.trim()
  }, [name, email, message])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend || sending) return
    setSending(true)
    setSuccess(null)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to send')
      setSuccess('Thanks! Your message has been sent.')
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch (e: any) {
      setError(e?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Send us a message</h2>
      {success && <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div className="md:col-span-2">
          <button disabled={!canSend || sending} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
      <p className="mt-4 text-xs text-gray-500">We’ll use your information only to respond to your inquiry.</p>
    </div>
  )
}



