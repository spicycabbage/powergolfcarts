'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface BannerConfig {
  text: string
  isActive: boolean
}

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [banner, setBanner] = useState<BannerConfig | null>(null)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/navigation')
        if (response.ok) {
          const data = await response.json()
          if (data.header?.banner) {
            setBanner(data.header.banner)
            setIsVisible(data.header.banner.isActive)
          }
        }
      } catch (error) {
        console.error('Failed to fetch banner:', error)
        // Fallback to default
        setBanner({
          text: 'Free shipping on orders over $50! Use code FREESHIP',
          isActive: true
        })
        setIsVisible(true)
      }
    }

    fetchBanner()
  }, [])

  if (!isVisible || !banner?.isActive || !banner?.text) return null

  return (
    <div className="bg-primary-600 text-white text-center py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-sm font-medium">
          {banner.text}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}



