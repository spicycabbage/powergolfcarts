'use client'

import { useState } from 'react'

export default function AdjustPoints({ userId, onDone }: { userId: string, onDone: () => void }) {
  const [delta, setDelta] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const adjust = async () => {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/loyalty/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, delta }) })
      const j = await r.json()
      if (!j?.success) alert(j?.error || 'Failed to update points')
      else onDone()
    } catch { alert('Failed to update points') } finally { setSaving(false); setDelta(0) }
  }
  return (
    <div className="inline-flex items-center gap-2">
      <input type="number" className="w-24 px-2 py-1 border rounded" value={delta} onChange={(e)=>setDelta(Number(e.target.value))} />
      <button className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" disabled={saving} onClick={adjust}>Apply</button>
    </div>
  )
}


