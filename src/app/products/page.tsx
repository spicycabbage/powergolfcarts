import { Metadata } from 'next'
import { ProductList } from '@/components/ProductList'

export const metadata: Metadata = {
  title: 'Products | Godbud.cc',
  description: 'Browse our complete product catalog with advanced filtering and search.',
  alternates: {
    canonical: '/products',
  },
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-2">Discover our complete product catalog</p>
            </div>
            <div className="flex items-center space-x-4" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <ProductList />
        </main>

        {/* Comprehensive Product Information Section */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Cannabis Product Catalog - Buy Weed Online in Canada
            </h2>
            
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                Welcome to Canada's most comprehensive online cannabis catalog, featuring over 90 unique products 
                from trusted Canadian suppliers. Our extensive selection includes premium flowers, potent concentrates, 
                delicious edibles, convenient vapes, traditional hash, and therapeutic CBD products - everything you 
                need for your cannabis journey.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Categories</h3>
                  <ul className="space-y-3">
                    <li><strong>Cannabis Flowers:</strong> Premium indica, sativa, and hybrid strains with detailed THC/CBD profiles</li>
                    <li><strong>Edibles:</strong> Gummies, chocolates, beverages, and baked goods with precise dosing</li>
                    <li><strong>Concentrates:</strong> Shatter, wax, live resin, rosin, and diamonds for experienced users</li>
                    <li><strong>Hash:</strong> Traditional Afghan, Lebanese, Moroccan, and modern bubble hash varieties</li>
                    <li><strong>Vapes:</strong> Cartridges, disposable pens, and devices for clean consumption</li>
                    <li><strong>CBD Products:</strong> Oils, capsules, and topicals for therapeutic benefits</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Shop With Us?</h3>
                  <ul className="space-y-3">
                    <li><strong>Quality Guarantee:</strong> All products lab-tested for potency and purity</li>
                    <li><strong>Competitive Pricing:</strong> Direct supplier relationships ensure best prices</li>
                    <li><strong>Fast Shipping:</strong> Free shipping on orders over $175, 2-5 day delivery</li>
                    <li><strong>Discreet Packaging:</strong> No identifying marks or odors for privacy</li>
                    <li><strong>Expert Support:</strong> Knowledgeable customer service team</li>
                    <li><strong>Secure Ordering:</strong> SSL encryption and secure payment processing</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Selection Process</h3>
                <p className="leading-relaxed mb-4">
                  Every product in our catalog is carefully selected through a rigorous evaluation process. We work 
                  exclusively with licensed Canadian producers who meet our strict quality standards. Each batch 
                  undergoes comprehensive testing for:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li>• Cannabinoid potency (THC/CBD levels)</li>
                    <li>• Pesticide and chemical residues</li>
                    <li>• Heavy metals and contaminants</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Microbial contamination</li>
                    <li>• Moisture content and freshness</li>
                    <li>• Terpene profiles and flavor</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ordering & Delivery</h3>
                  <p className="leading-relaxed">
                    Our streamlined ordering process makes it easy to buy weed online in Canada. Browse our catalog, 
                    read detailed product descriptions and customer reviews, add items to your cart, and checkout 
                    securely. We accept various payment methods including e-transfer, credit cards, and cryptocurrency. 
                    Orders are processed within 24 hours and shipped via Canada Post with tracking information provided.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
                  <p className="leading-relaxed">
                    Since 2019, we've built our reputation on customer satisfaction and product quality. Our return 
                    policy ensures peace of mind - while we don't accept returns due to the nature of cannabis products, 
                    we offer store credit for any unsatisfactory items. Our customer service team is available to help 
                    with product selection, dosage guidance, and any questions about your order.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="text-xl font-semibold text-primary-900 mb-4">Legal & Responsible Use</h3>
                <p className="text-primary-800 leading-relaxed">
                  All our products comply with Canadian cannabis regulations. Customers must be 19+ (18+ in Alberta and Quebec) 
                  to purchase. Please consume responsibly, start with low doses, and store products safely away from children 
                  and pets. Do not drive or operate machinery after consumption. Cannabis affects everyone differently - know 
                  your limits and consume in a safe environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






