'use client'

import { useState } from 'react'
import { OptimizedImage } from '@/components/OptimizedImage'
import { normalizeImageUrl } from '@/utils/image'

interface ProductImage {
  _id: string
  url: string
  alt: string
  width: number
  height: number
  isPrimary: boolean
}

interface ProductImageGalleryProps {
  images: string[] | ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  // Helper function to get image source
  const getImageSrc = (image: string | ProductImage): string => normalizeImageUrl(image as any)

  // Helper function to get image alt text
  const getImageAlt = (image: string | ProductImage, index: number): string => {
    if (typeof image === 'string') {
      return `${productName} ${index + 1}`
    }
    return image.alt || `${productName} ${index + 1}`
  }

  const currentImage = images[selectedImage]
  const imageSrc = getImageSrc(currentImage)

  // Don't render if image source is empty
  if (!imageSrc || imageSrc.trim() === '') {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Image not available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        <OptimizedImage
          key={`main-image-${selectedImage}`}
          src={imageSrc}
          alt={getImageAlt(currentImage, selectedImage)}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={90}
          priority
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images
            .map((image, index) => ({ image, originalIndex: index }))
            .filter(({ image }) => {
              const thumbSrc = getImageSrc(image)
              return thumbSrc && thumbSrc.trim() !== ''
            })
            .map(({ image, originalIndex }) => {
              const thumbSrc = getImageSrc(image)
              const thumbAlt = getImageAlt(image, originalIndex)

              return (
                <div
                  key={typeof image === 'string' ? `img-${originalIndex}` : image._id || `img-${originalIndex}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedImage(originalIndex)
                  }}
                  className={`w-20 h-20 relative rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer hover:border-primary-400 transition-colors ${
                    selectedImage === originalIndex ? 'border-primary-600' : 'border-gray-200'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                <OptimizedImage
                  src={thumbSrc}
                  alt={thumbAlt}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="80px"
                  quality={75}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
