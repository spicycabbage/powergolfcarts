"use client"
import { Star } from 'lucide-react'

interface ClickableRatingProps {
  averageRating: number
  reviewCount: number
}

export function ClickableRating({ averageRating, reviewCount }: ClickableRatingProps) {
  const handleClick = () => {
    const reviewsSection = document.querySelector('[data-reviews-tabs]');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
      // Trigger click on Reviews tab
      const reviewsTab = reviewsSection.querySelector('[data-tab="reviews"]') as HTMLButtonElement;
      if (reviewsTab) {
        reviewsTab.click();
      }
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={handleClick}
        className="flex items-center space-x-2 hover:opacity-75 transition-opacity cursor-pointer"
      >
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => {
            const fillPercentage = Math.max(0, Math.min(1, (averageRating || 0) - i))
            
            return (
              <div key={i} className="relative w-5 h-5">
                {/* Background star (empty) */}
                <Star className="w-5 h-5 text-gray-300 absolute" />
                
                {/* Foreground star (filled) */}
                <div 
                  className="overflow-hidden absolute"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
            )
          })}
        </div>
        <span className="text-gray-600 hover:text-blue-600 transition-colors">
          {averageRating || 0} ({reviewCount || 0} reviews)
        </span>
      </button>
    </div>
  )
}
