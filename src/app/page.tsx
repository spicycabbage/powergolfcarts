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

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Featured Products */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>

      {/* Category Grid */}
      <CategoryGrid />
      
      <section className="bg-white pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Voted One of Canada's Top Online Dispensaries
          </h2>
          <p className="text-gray-700 mb-4">
            Trusted by thousands of customers and featured across major cannabis platforms
          </p>
          <p className="text-sm text-gray-600 mb-6">
            As seen on Cannabis Culture, Weedmaps, The Weed Blog, and Leafly - Canada's most trusted cannabis review platforms
          </p>
          <img
            src="/trust-logos.webp"
            alt="As seen on platforms like Cannabis Culture, Weedmaps, The Weed Blog, and Leafly"
            className="h-auto max-h-[120px] object-contain mx-auto mb-6"
          />
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Since 2019, Godbud.cc has been recognized as one of Canada's premier online cannabis dispensaries. 
              Our commitment to quality, customer service, and competitive pricing has earned us features on leading 
              cannabis platforms and thousands of positive customer reviews. Join the community of satisfied customers 
              who trust us for their cannabis needs across Canada.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              We understand that choosing the right cannabis products can be overwhelming, which is why our expert team 
              carefully curates every item in our catalog. From premium BC flowers and artisanal concentrates to precisely 
              dosed edibles and convenient vape cartridges, we ensure that every product meets our strict quality standards. 
              Our partnerships with licensed Canadian producers guarantee that you receive authentic, lab-tested cannabis 
              products that are safe, potent, and consistent.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Shopping with Godbud.cc means accessing Canada's most comprehensive cannabis selection with the convenience 
              of online ordering and discreet home delivery. Our knowledgeable customer service team is always available 
              to help you find the perfect products for your needs, whether you're seeking relaxation, creativity, pain 
              relief, or simply exploring the world of cannabis. Experience the difference that quality, service, and 
              expertise make when you choose Canada's trusted online cannabis destination.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <RecentBlogPosts />

      {/* Introduction Section */}
      <Introduction />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  )
}


