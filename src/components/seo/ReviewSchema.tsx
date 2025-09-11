'use client'

import JsonLd from './JsonLd'

interface ReviewSchemaProps {
  reviews: Array<{
    _id: string
    rating: number
    comment: string
    user?: {
      firstName?: string
      name?: string
    }
    customerName?: string
    createdAt: string
  }>
  productName: string
  productUrl: string
}

export default function ReviewSchema({ reviews, productName, productUrl }: ReviewSchemaProps) {
  if (!reviews || reviews.length === 0) return null

  const reviewSchemas = reviews.map((review, index) => ({
    '@type': 'Review',
    '@id': `${productUrl}#review-${review._id}`,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    author: {
      '@type': 'Person',
      name: review.user?.firstName || review.user?.name || review.customerName || 'Anonymous Customer'
    },
    reviewBody: review.comment,
    datePublished: new Date(review.createdAt).toISOString(),
    itemReviewed: {
      '@type': 'Product',
      name: productName,
      url: productUrl
    }
  }))

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': reviewSchemas
      }}
    />
  )
}
