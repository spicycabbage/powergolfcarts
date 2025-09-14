'use client'

import { useEffect, useState } from 'react'

export default function LoyaltyPoints({ userId }: { userId?: string }) {
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [rate, setRate] = useState<number>(1)
  const [rewards, setRewards] = useState<any[]>([])
  const [redeeming, setRedeeming] = useState<string>('')
  const [myCoupons, setMyCoupons] = useState<{ code: string; value: number; createdAt?: string; usedAt?: string | null }[]>([])
  const [ordersIndex, setOrdersIndex] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      try {
        // fetch user profile lightweight endpoint (no cache)
        const u = await fetch('/api/user/me', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (u && u.success) { setPoints(Number(u.data?.loyaltyPoints ?? 0)); setMyCoupons(Array.isArray(u.data?.loyaltyCoupons) ? u.data.loyaltyCoupons : []) }
      } catch {}
      try {
        const cfg = await fetch('/api/admin/loyalty/config', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (cfg && cfg.success) setRate(Number(cfg.data?.pointsPerDollar ?? 1))
      } catch {}
      try {
        const rw = await fetch('/api/loyalty/rewards', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (rw && rw.success) {
          const list = Array.isArray(rw.data) ? rw.data : []
          const seen = new Set<string>()
          const unique = [] as any[]
          for (const r of list) {
            const k = `${Number(r.value||0)}|${Number(r.pointsCost||0)}`
            if (!seen.has(k)) { seen.add(k); unique.push(r) }
          }
          setRewards(unique)
        }
      } catch {}
      try {
        const o = await fetch('/api/orders?page=1&limit=100', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (o && o.success && Array.isArray(o.data)) {
          const map: Record<string,string> = {}
          for (const ord of o.data) {
            const code = (ord as any)?.coupon?.code
            if (code) {
              const idText = (ord as any)?.invoiceNumber || String((ord as any)?._id || '').toString().slice(-8).toUpperCase()
              if (idText) map[code] = `#${idText}`
            }
          }
          setOrdersIndex(map)
        }
      } catch {}
      // no auto-apply; do not read session storage here
      setLoading(false)
    })()
  }, [userId])

  const redeem = async (rewardId: string) => {
    if (redeeming) return
    const chosen = rewards.find(r => r._id === rewardId)
    try {
      const ok = confirm(`Redeem ${Number(chosen?.pointsCost||0)} points for a ${chosen?.name || 'coupon'}?`)
      if (!ok) return
    } catch {}
    setRedeeming(rewardId)
    try {
      const res = await fetch('/api/loyalty/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rewardId }) })
      const j = await res.json()
      if (!res.ok || !j?.success) {
        alert(j?.error || 'Failed to redeem')
      } else {
        alert(`Your code: ${j.data.code} (value $${Number(j.data.value||0).toFixed(2)})`)
        // refresh points
        try { const u = await fetch('/api/user/me', { cache: 'no-store' }).then(r=>r.json()); if (u?.success) { setPoints(Number(u.data?.loyaltyPoints||0)); setMyCoupons(Array.isArray(u.data?.loyaltyCoupons) ? u.data.loyaltyCoupons : []) } } catch {}
      }
    } catch {
      alert('Failed to redeem')
    } finally {
      setRedeeming('')
    }
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Loyalty Points</h2>
      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{Number(points||0).toLocaleString()} pts</div>
          <p className="text-sm text-gray-600">You earn {rate} point(s) per $1 spent on products after discounts. Points are added when an order is marked Completed. Redeem your points for valuable coupons.</p>
          {Array.isArray(rewards) && rewards.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Redeem Rewards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rewards.map(r => {
                  const val = Number(r.value||0)
                  const enabled = Number(points||0) >= Number(r.pointsCost||0) && redeeming!==r._id
                  const color = val === 20
                    ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                    : val === 50
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white hover:bg-gray-50'
                  return (
                    <button key={r._id} onClick={()=>redeem(r._id)} disabled={!enabled} className={`p-3 border rounded-lg text-left ${color} ${enabled ? '' : 'opacity-60 cursor-not-allowed'}`}>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-sm">Cost: {Number(r.pointsCost||0)} pts</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {Array.isArray(myCoupons) && myCoupons.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Loyalty Coupons</h3>
              <ul className="space-y-2">
                {myCoupons.map((c, idx) => (
                  <li key={`${c.code}-${idx}`} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-gray-900 font-medium">Code: <span className="font-mono">{c.code}</span></div>
                      <div className="text-xs text-gray-600">{c.usedAt ? `Used on order ${ordersIndex[c.code] || ''}` : `Value: $${Number(c.value||0).toFixed(2)}`}</div>
                    </div>
                    <button onClick={async()=>{ try { await navigator.clipboard.writeText(c.code); alert('Copied!') } catch { alert('Copy failed') } }} className="px-3 py-1 border rounded">Copy</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


