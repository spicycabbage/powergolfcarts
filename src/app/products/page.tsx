import { Metadata } from 'next'
import { ProductList } from '@/components/ProductList'

export const metadata: Metadata = {
  title: 'Products | Insanity Golf',
  description: 'Browse our complete golf equipment catalog with advanced filtering and search.',
  alternates: {
    canonical: '/products',
  },
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <h1 className="text-3xl font-bold text-gray-900">All Golf Products</h1>
        <p className="text-gray-700 mt-0.5">Discover our complete golf equipment catalog</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ProductList />

        {/* Comprehensive Product Information Section - Lazy Loaded */}
        <section className="mt-16 bg-white rounded-lg p-8 shadow-sm max-w-4xl mx-auto" style={{ contentVisibility: 'auto' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Golf Equipment Catalog - Premium Golf Products Online
            </h2>
            
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                Welcome to Canada's most comprehensive online golf equipment catalog, featuring premium golf products 
                from trusted manufacturers. Our extensive selection includes electric golf caddies, clubs, balls, 
                bags, accessories, and training aids - everything you need for your golf journey.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Categories</h3>
                  <ul className="space-y-3">
                    <li><strong>Electric Golf Caddies:</strong> Premium electric golf carts with advanced navigation and battery technology</li>
                    <li><strong>Golf Clubs:</strong> Drivers, irons, wedges, and putters from top manufacturers</li>
                    <li><strong>Golf Balls:</strong> Distance, control, and premium balls for all skill levels</li>
                    <li><strong>Golf Bags:</strong> Cart bags, stand bags, and travel bags for every need</li>
                    <li><strong>Accessories:</strong> Gloves, tees, markers, and essential golf accessories</li>
                    <li><strong>Training Aids:</strong> Practice equipment and tools to improve your game</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Shop With Us?</h3>
                  <ul className="space-y-3">
                    <li><strong>Quality Guarantee:</strong> All products from authorized dealers with warranties</li>
                    <li><strong>Competitive Pricing:</strong> Direct manufacturer relationships ensure best prices</li>
                    <li><strong>Fast Shipping:</strong> Free shipping on orders over $175, 2-5 day delivery</li>
                    <li><strong>Expert Support:</strong> Knowledgeable golf equipment specialists</li>
                    <li><strong>Secure Ordering:</strong> SSL encryption and secure payment processing</li>
                    <li><strong>Professional Service:</strong> Golf equipment fitting and consultation available</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Selection Process</h3>
                <p className="leading-relaxed mb-4">
                  Every product in our catalog is carefully selected through a rigorous evaluation process. We work 
                  exclusively with authorized dealers and manufacturers who meet our strict quality standards. Each product 
                  undergoes comprehensive evaluation for:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li>• Performance specifications and technology</li>
                    <li>• Build quality and durability</li>
                    <li>• Manufacturer warranties and support</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Customer reviews and feedback</li>
                    <li>• Professional testing and validation</li>
                    <li>• Value and competitive pricing</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ordering & Delivery</h3>
                  <p className="leading-relaxed">
                    Our streamlined ordering process makes it easy to buy golf equipment online. Browse our catalog, 
                    read detailed product descriptions and customer reviews, add items to your cart, and checkout 
                    securely. We accept various payment methods including credit cards, PayPal, and bank transfers. 
                    Orders are processed within 24 hours and shipped via reliable carriers with tracking information provided.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
                  <p className="leading-relaxed">
                    We've built our reputation on customer satisfaction and product quality. Our return 
                    policy ensures peace of mind with 30-day returns on most items. Our customer service team is available to help 
                    with product selection, equipment fitting guidance, and any questions about your order.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">Golf Equipment Care & Safety</h3>
                <p className="text-primary-800 leading-relaxed">
                  All our golf equipment meets industry safety standards. Please follow manufacturer guidelines for 
                  proper use and maintenance. Store equipment in dry, temperature-controlled environments and 
                  perform regular maintenance as recommended. Electric golf caddies should be charged according to 
                  manufacturer specifications and used responsibly on golf courses.
                </p>
              </div>
            </div>
        </section>
      </main>
    </div>
  )
}






