'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fetchPriority = 'auto',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Generate optimized image path with SEO-friendly fallback logic
  const getOptimizedSrc = (originalSrc: string, preferredFormat: 'webp' | 'jpg' = 'webp') => {
    // If it's already an external URL, return as-is
    if (originalSrc.startsWith('http') || originalSrc.startsWith('//')) {
      return originalSrc
    }

    // If it's already optimized, return as-is
    if (originalSrc.includes('/optimized/')) {
      return originalSrc
    }

    // Convert uploads path to optimized path while preserving SEO filename
    if (originalSrc.startsWith('/uploads/')) {
      const pathWithoutUploads = originalSrc.replace('/uploads/', '')
      const pathParts = pathWithoutUploads.split('/')
      const filename = pathParts.pop()
      const directory = pathParts.join('/')
      
      if (filename) {
        // Extract the SEO-friendly name and extension
        const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        const optimizedFilename = `${nameWithoutExt}.${preferredFormat}`
        
        // Build the optimized path maintaining directory structure
        if (directory) {
          return `/optimized/${directory}/${optimizedFilename}`
        } else {
          return `/optimized/${optimizedFilename}`
        }
      }
    }

    return originalSrc
  }

  // Error handling with fallback chain
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      
      // Try fallback to JPEG if we were trying WebP
      if (imageSrc.includes('.webp')) {
        const jpegSrc = imageSrc.replace('.webp', '.jpg')
        setImageSrc(jpegSrc)
        return
      }
      
      // If JPEG also fails, try original
      if (imageSrc.includes('/optimized/')) {
        const originalSrc = imageSrc.replace('/optimized/', '/uploads/')
        setImageSrc(originalSrc)
        return
      }
      
      // Final fallback to placeholder
      setImageSrc('/placeholder-product.jpg')
    }
    onError?.()
  }

  const handleLoad = () => {
    setHasError(false)
    onLoad?.()
  }

  // Try optimized WebP first, with fallback chain
  const optimizedSrc = hasError ? imageSrc : getOptimizedSrc(imageSrc, 'webp')

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : width 
        ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  )

  const imageProps: any = {
    src: optimizedSrc,
    alt,
    className,
    quality,
    priority,
    placeholder,
    onLoad: handleLoad,
    onError: handleError,
  }

  // Add fetchPriority for LCP optimization
  if (priority || fetchPriority === 'high') {
    imageProps.fetchPriority = 'high'
  } else if (fetchPriority === 'low') {
    imageProps.fetchPriority = 'low'
  }

  if (fill) {
    imageProps.fill = true
    imageProps.sizes = responsiveSizes
  } else {
    imageProps.width = width
    imageProps.height = height
    if (width && height) {
      imageProps.sizes = responsiveSizes
    }
  }

  if (blurDataURL) {
    imageProps.blurDataURL = blurDataURL
  }

  return <Image {...imageProps} />
}

// Helper function to generate blur data URL for better loading experience
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  // Simple base64 encoded 1x1 transparent pixel for SSR compatibility
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
}

export default OptimizedImage
