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

      {/* Voted Text Section */}
      <section className="bg-white pt-4 pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Voted one of Canada's top online dispensary
          </h2>
          <p className="text-sm text-gray-600">
            As seen on:
          </p>
        </div>
      </section>

      {/* Trust Logos Section */}
      <section className="h-[200px] bg-white flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <img 
            src="/trust-logos.png" 
            alt="Trusted by leading companies"
            className="w-full h-auto max-h-[160px] object-contain"
          />
        </div>
      </section>

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


