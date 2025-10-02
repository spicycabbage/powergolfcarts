import { Suspense } from 'react'
import { Metadata } from 'next'
// Remove Head import - we'll use Next.js metadata instead
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
  title: 'Power Golf Carts - Premium Electric Golf Carts & Equipment Online',
  description: "Shop premium electric golf carts, accessories, and equipment at Power Golf Carts. Quality golf cart products for golfers of all skill levels with fast shipping.",
  keywords: 'golf equipment, golf clubs, golf balls, golf gear, golf accessories, golf apparel, online golf store',
  // Remove other metadata - we'll handle preloading differently
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
            '@id': 'https://www.insanitygolf.com/#store',
            name: 'Power Golf Carts',
            description: "Premium golf equipment and accessories for golfers of all skill levels",
            url: 'https://www.insanitygolf.com',
            telephone: '+1-800-GOLF',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'US'
            },
            openingHours: 'Mo-Su 00:00-23:59',
            currenciesAccepted: 'USD',
            paymentAccepted: ['Credit Card', 'Debit Card', 'PayPal']
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            '@id': 'https://www.insanitygolf.com/#productcategories',
            name: 'Golf Equipment Categories',
            description: 'Browse our selection of premium golf equipment',
            numberOfItems: 5,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Golf Clubs',
                url: 'https://www.insanitygolf.com/categories/golf-clubs'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Golf Balls',
                url: 'https://www.insanitygolf.com/categories/golf-balls'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Golf Bags',
                url: 'https://www.insanitygolf.com/categories/golf-bags'
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: 'Accessories',
                url: 'https://www.insanitygolf.com/categories/accessories'
              },
              {
                '@type': 'ListItem',
                position: 5,
                name: 'Apparel',
                url: 'https://www.insanitygolf.com/categories/apparel'
              }
            ]
          }
        ]}
      />
      {/* Warm backend after initial paint (idle) to avoid blocking mobile LCP */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          if (typeof window==='undefined') return;
          if (window.__warmed) return; window.__warmed = true;
          var warm = function(){ try { fetch('/api/warmup',{ cache:'no-store' }); } catch(e){} };
          if ('requestIdleCallback' in window) {
            requestIdleCallback(warm, { timeout: 5000 });
          } else {
            window.addEventListener('load', function(){ setTimeout(warm, 1200); }, { once: true });
          }
        })();
      `}} />
      
      {/* Main H1 for SEO - Visible to crawlers */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <h1 className="text-lg font-semibold text-gray-900 text-center">Premium Golf Equipment & Gear</h1>
        </div>
      </div>
      
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
      
      <section className="bg-white pt-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Your Trusted Golf Equipment Retailer
        </h2>
        <p className="text-gray-700 mb-4">
          Trusted by golfers nationwide for premium equipment and expert service
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Partnered with leading golf brands to bring you the best equipment for your game
        </p>
        <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Power Golf Carts has been dedicated to providing golfers of all skill levels with premium electric golf cart equipment and expert guidance. 
              Our commitment to quality, competitive pricing, and exceptional customer service has made us a trusted destination 
              for golfers looking to improve their game. Join thousands of satisfied customers who rely on us for their golf needs.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              We understand that choosing the right golf equipment can be challenging, which is why our expert team 
              carefully selects every item in our catalog. From top-tier drivers and precision irons to high-performance balls 
              and premium accessories, we ensure that every product meets our strict quality standards. Our partnerships with 
              leading golf brands guarantee that you receive authentic, tour-tested equipment that delivers results.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Shopping with Power Golf Carts means accessing a comprehensive selection of electric golf cart equipment with the convenience 
              of online ordering and fast shipping. Our knowledgeable customer service team is always available to help you 
              find the perfect equipment for your game, whether you're a beginner, weekend warrior, or competitive player. 
              Experience the difference that quality, service, and expertise make when you choose Power Golf Carts.
            </p>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <RecentBlogPosts />

      {/* Introduction Section */}
      <Introduction />

      {/* Newsletter Signup */}
      <NewsletterSignup />
      
      <section className="bg-gray-50 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Premier Golf Equipment Destination</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Premium Golf Equipment</h3>
                <p className="text-gray-700 mb-4">
                  Our extensive selection includes top-tier golf clubs, high-performance balls, premium bags, 
                  essential accessories, and quality apparel. Every product is sourced from leading golf brands 
                  and tested for quality, performance, and durability.
                </p>
                <p className="text-gray-700">
                  From the latest drivers and fairway woods to precision irons and forgiving putters, our club selection 
                  caters to all skill levels. Our golf balls range from tour-level performance to distance-focused designs, 
                  while our accessories include everything you need to elevate your game.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trusted Golf Experts</h3>
                <p className="text-gray-700 mb-4">
                  With thousands of satisfied golfers nationwide, we've built our reputation on quality equipment, 
                  competitive pricing, and exceptional customer service. Our knowledgeable team is always available to 
                  help you find the perfect gear for your game.
                </p>
                <p className="text-gray-700">
                  We offer fast shipping nationwide with secure packaging and reliable delivery. Whether you're 
                  just starting out, improving your game, or competing at a high level, we provide the 
                  equipment and expertise you need to succeed on the course.
                </p>
              </div>
            </div>
        </div>
      </section>
    </div>
  )
}


