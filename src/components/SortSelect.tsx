'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  value?: string
}

const options = [
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating' },
  { value: 'popular', label: 'Most Popular' },
]

export default function SortSelect({ value }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = value || searchParams.get('sort') || 'priceDesc'

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (next && next !== 'priceDesc') params.set('sort', next)
    else params.delete('sort')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="text-sm border border-gray-300 rounded-lg pl-3 pr-8 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}


