import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Customer Service</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/contact" className="block hover:text-white">Contact Us</Link>
              <Link href="/faq" className="block hover:text-white">FAQ</Link>
              <Link href="/shipping" className="block hover:text-white">US Shipping Fees</Link>
              <Link href="/terms-conditions" className="block hover:text-white">Terms and Conditions</Link>
              <Link href="/delivery" className="block hover:text-white">Delivery Information</Link>
              <Link href="/returns" className="block hover:text-white">Return Policy</Link>
            </div>
          </div>

          {/* Technical Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Technical Support</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/warranty-request" className="block hover:text-white">Warranty Request Form</Link>
              <Link href="/warranty" className="block hover:text-white">Warranty Information</Link>
              <Link href="/videos" className="block hover:text-white">Technical Videos</Link>
              <Link href="/manuals" className="block hover:text-white">Instruction Manuals</Link>
              <Link href="/battery-care" className="block hover:text-white">Battery Care</Link>
              <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
            </div>
          </div>

          {/* About Insanity Golf */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">About Power Golf Carts</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/reviews" className="block hover:text-white">Our Reviews</Link>
              <Link href="/showcase" className="block hover:text-white">Showcase Videos</Link>
              <Link href="/blog" className="block hover:text-white">Blog</Link>
              <Link href="/legal" className="block hover:text-white">Legal Information</Link>
              <Link href="/showrooms" className="block hover:text-white">Find a Show Room</Link>
              <Link href="/promotions" className="block hover:text-white">Promotions</Link>
            </div>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get In Touch</h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <p className="text-sm mb-1">
                  <strong className="text-white">Phone:</strong> 1-778-861-8599
                </p>
                <p className="text-sm mb-1">
                  <strong className="text-white">Email:</strong> info@powergolfcarts.com
                </p>
                <p className="text-sm mb-3">
                  <strong className="text-white">Text Support:</strong> 1-604-319-4330
                </p>
              </div>
              <div>
                <p className="text-sm text-white mb-2">Follow us:</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white text-sm">Facebook</a>
                  <a href="#" className="text-gray-300 hover:text-white text-sm">TikTok</a>
                  <a href="#" className="text-gray-300 hover:text-white text-sm">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div>
            <Link href="/" className="text-2xl font-bold text-white mb-2 block">Power Golf Carts</Link>
            <p className="text-gray-400 text-sm">© {currentYear} by Power Golf Carts. All rights reserved.</p>
            <p className="text-gray-500 text-xs mt-1">Power Golf Carts has copyright for all the photos and videos.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

