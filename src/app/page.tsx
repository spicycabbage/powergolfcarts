import { Suspense } from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/HeroSection'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { CategoryGrid } from '@/components/CategoryGrid'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Home | E-Commerce Store',
  description: 'Discover amazing products at our online store. Shop the latest trends with fast shipping and great prices.',
  keywords: 'ecommerce, shopping, online store, featured products, deals',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>

      {/* Category Grid */}
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryGrid />
      </Suspense>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}


