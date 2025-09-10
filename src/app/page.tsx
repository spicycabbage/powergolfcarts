import { Suspense } from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/HeroSection'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { CategoryGrid } from '@/components/CategoryGrid'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Home | Godbud.cc',
  description: 'Discover amazing products at our online store. Shop the latest trends with fast shipping and great prices.',
  keywords: 'ecommerce, shopping, online store, featured products, deals',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Warm backend on first visit to reduce cold-start latency */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          if (typeof window==='undefined') return;
          if (window.__warmed) return; window.__warmed = true;
          try { fetch('/api/warmup', { cache: 'no-store' }); } catch(e){}
        })();
      `}} />
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>

      {/* Category Grid */}
      <CategoryGrid />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}


