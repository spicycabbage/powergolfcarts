"use client"
import { Star } from 'lucide-react'

interface ProductRatingProps {
  averageRating: number
  reviewCount: number
  size?: 'sm' | 'md'
  showCount?: boolean
}

export function ProductRating({ 
  averageRating, 
  reviewCount, 
  size = 'sm',
  showCount = true 
}: ProductRatingProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  
  if (reviewCount === 0) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        {showCount && (
          <span className={`${textSize} text-gray-400`}>No reviews</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1
          const fillPercentage = Math.max(0, Math.min(1, averageRating - i))
          
          return (
            <div key={i} className={`relative ${starSize}`}>
              {/* Background star (empty) */}
              <Star className={`${starSize} text-gray-300 absolute`} />
              
              {/* Foreground star (filled) */}
              <div 
                className="overflow-hidden absolute"
                style={{ width: `${fillPercentage * 100}%` }}
              >
                <Star className={`${starSize} text-yellow-400 fill-current`} />
              </div>
            </div>
          )
        })}
      </div>
      {showCount && (
        <span className={`${textSize} text-gray-600`}>
          {averageRating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  )
}
