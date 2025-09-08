'use client'

import { useState } from 'react'
import Image from 'next/image'
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
        <Image
          src={imageSrc}
          alt={getImageAlt(currentImage, selectedImage)}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => {
            const thumbSrc = getImageSrc(image)
            const thumbAlt = getImageAlt(image, index)

            // Skip thumbnails with empty sources
            if (!thumbSrc || thumbSrc.trim() === '') {
              return null
            }

            return (
              <button
                key={typeof image === 'string' ? index : image._id}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 relative rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                  selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={thumbAlt}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
