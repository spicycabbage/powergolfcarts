'use client'

import { useEffect, useState } from 'react'

export default function LoyaltyPoints({ userId }: { userId?: string }) {
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [rate, setRate] = useState<number>(1)

  useEffect(() => {
    ;(async () => {
      try {
        // fetch user profile lightweight endpoint; fallback to orders list to infer
        const u = await fetch('/api/user/me', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (u && u.success) setPoints(Number(u.data?.loyaltyPoints ?? 0))
      } catch {}
      try {
        const cfg = await fetch('/api/admin/loyalty/config', { cache: 'no-store' }).then(r=>r.ok?r.json():null).catch(()=>null)
        if (cfg && cfg.success) setRate(Number(cfg.data?.pointsPerDollar ?? 1))
      } catch {}
      setLoading(false)
    })()
  }, [userId])

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Loyalty Points</h2>
      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{Number(points||0).toLocaleString()} pts</div>
          <p className="text-sm text-gray-600">You earn {rate} point(s) per $1 spent on products after discounts. Points are added when an order is marked Completed.</p>
        </div>
      )}
    </div>
  )
}


