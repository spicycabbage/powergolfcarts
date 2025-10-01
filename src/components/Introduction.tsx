import Link from 'next/link'

export function Introduction() {
  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Trusted Golf Equipment Retailer
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Insanity Golf's mission is to provide golfers with a reliable platform to shop premium golf equipment at competitive prices. Working directly with leading golf brands, we ensure that any product you order — from our selection of clubs to golf balls, bags, accessories, and apparel — is of top quality.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8">
          We pride ourselves on building long-lasting relationships with our customers. If you're looking for a trusted online retailer to purchase high-quality golf equipment, look no further and join our community today.
        </p>

        {/* Additional Content Sections */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Golf Equipment</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our extensive catalog features a wide selection of golf equipment, including premium drivers, precision irons, performance putters, specialty wedges, high-quality golf balls, and durable bags. Each item is carefully selected from trusted brands and tested for performance and durability.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From industry leaders like TaylorMade and Callaway to innovative brands like Titleist and Ping, we offer something for every golfer. Our products range from beginner-friendly options to tour-level equipment for experienced players.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Secure Delivery</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We understand the importance of getting your golf equipment quickly so you can hit the course. That's why we offer free shipping on orders over $100 and ensure all packages are securely packaged to prevent damage during transit.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our shipping network covers the entire United States, with most orders arriving within 3-5 business days. We use secure, trackable shipping methods and provide real-time updates on your order status from purchase to delivery.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Why Shop Golf Equipment Online?</h3>
          <p className="text-gray-600 leading-relaxed">
            Shopping for golf equipment online offers unparalleled convenience, selection, and value compared to traditional pro shops. Browse from the comfort of your home, access detailed product specifications and reviews, enjoy competitive pricing, and receive your golf gear directly at your door. Our online platform is available 24/7, allowing you to shop whenever it's convenient for you.
          </p>
        </div>
      </div>
    </section>
  )
}
