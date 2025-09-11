import { Suspense } from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/HeroSection'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { CategoryGrid } from '@/components/CategoryGrid'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { RecentBlogPosts } from '@/components/RecentBlogPosts'
import { WhyChooseUs } from '@/components/WhyChooseUs'
import { Introduction } from '@/components/Introduction'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Godbud.cc: Buy Weed Online in Canada | Mail Order Marijuana',
  description: "Godbud.cc is Canada's top online dispensary for high-quality cannabis. We offer a wide selection of flowers, edibles, vapes, and concentrates with fast, discreet shipping.",
  keywords: 'buy weed online, mail order marijuana, online dispensary, cannabis, canada, flowers, edibles, concentrates',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Additional Schema Markup for Homepage */}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Store',
            '@id': 'https://www.godbud.cc/#store',
            name: 'Godbud.cc',
            description: "Canada's top online dispensary for high-quality cannabis products",
            url: 'https://www.godbud.cc',
            telephone: '+1-800-GODBUD',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'CA'
            },
            openingHours: 'Mo-Su 00:00-23:59',
            currenciesAccepted: 'CAD',
            paymentAccepted: ['Credit Card', 'Debit Card', 'E-Transfer']
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            '@id': 'https://www.godbud.cc/#productcategories',
            name: 'Cannabis Product Categories',
            description: 'Browse our selection of premium cannabis products',
            numberOfItems: 6,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Flowers',
                url: 'https://www.godbud.cc/categories/flowers'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Edibles',
                url: 'https://www.godbud.cc/categories/edibles'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Concentrates',
                url: 'https://www.godbud.cc/categories/concentrates'
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: 'Vapes',
                url: 'https://www.godbud.cc/categories/vapes'
              },
              {
                '@type': 'ListItem',
                position: 5,
                name: 'Pre-Rolls',
                url: 'https://www.godbud.cc/categories/pre-rolls'
              },
              {
                '@type': 'ListItem',
                position: 6,
                name: 'Accessories',
                url: 'https://www.godbud.cc/categories/accessories'
              }
            ]
          }
        ]}
      />
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

      {/* Trust Logos & "As Seen On" Section */}
      <section className="bg-gray-50 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Voted One of Canada's Top Online Dispensaries
          </h2>
          <p className="text-gray-600 mb-6">
            As seen on:
          </p>
          <div className="flex justify-center">
            <img
              src="/trust-logos.webp"
              alt="As seen on platforms like Cannabis Culture, Weedmaps, The Weed Blog, and Leafly"
              className="h-auto max-h-[120px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Category Grid */}
      <CategoryGrid />
      
      {/* Introduction Section */}
      <Introduction />

      {/* Recent Blog Posts */}
      <RecentBlogPosts />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}


