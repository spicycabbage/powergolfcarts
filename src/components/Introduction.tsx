import Link from 'next/link'

export function Introduction() {
  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Canada's Trusted Mail Order Marijuana Dispensary
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Godbud.cc's mission is to provide Canadians with a safe, reliable, and secure platform to buy weed online at affordable prices. Working directly with a strong network of cannabis suppliers, we ensure that any product you order — from our wide selection of flowers to our marijuana edibles, concentrates, vapes, and CBD products — is of top quality.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            We pride ourselves on building long-lasting relationships with our customers. If you're looking for a trusted online dispensary to purchase high-quality cannabis, look no further and join our community today.
          </p>
        </div>

        {/* Additional Content Sections */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Cannabis Products</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our extensive catalog features over 90 unique cannabis products, including premium flowers, potent concentrates, delicious edibles, convenient vapes, and therapeutic CBD products. Each item is carefully selected from trusted Canadian suppliers and tested for quality and potency.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From classic strains like Afghan Hash and Temple Ball Hash to modern favorites like Pink Kush and Wedding Cake, we offer something for every cannabis enthusiast. Our products range from beginner-friendly options to high-potency concentrates for experienced users.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Discreet Delivery</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We understand the importance of privacy and speed when you buy weed online in Canada. That's why we offer free shipping on orders over $175 and ensure all packages are discreetly packaged with no identifying marks or odors.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our shipping network covers all provinces and territories across Canada, with most orders arriving within 2-5 business days. We use secure, trackable shipping methods and provide real-time updates on your order status from purchase to delivery.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Why Choose Mail Order Marijuana?</h3>
          <p className="text-gray-600 leading-relaxed text-center">
            Mail order marijuana offers unparalleled convenience, privacy, and selection compared to traditional dispensaries. Shop from the comfort of your home, access detailed product information and reviews, enjoy competitive pricing, and receive your cannabis products directly at your door. Our online platform is available 24/7, allowing you to browse and order whenever it's convenient for you.
          </p>
        </div>
      </div>
    </section>
  )
}
