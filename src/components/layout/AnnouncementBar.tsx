'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BannerConfig {
  text: string
  isActive: boolean
}

export function AnnouncementBar({ banner }: { banner?: BannerConfig }) {
  const [isVisible, setIsVisible] = useState<boolean>(!!banner?.isActive)

  if (!banner || !isVisible || !banner.isActive || !banner.text) return null

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



