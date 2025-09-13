import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Shop</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/categories" className="block hover:text-white">Shop All</Link>
              <Link href="/categories/flowers" className="block hover:text-white">Flowers</Link>
              <Link href="/categories/concentrates" className="block hover:text-white">Concentrates</Link>
              <Link href="/categories/hash" className="block hover:text-white">Hash</Link>
              <Link href="/categories/edibles" className="block hover:text-white">Edibles</Link>
              <Link href="/categories/cbd" className="block hover:text-white">CBD</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/contact" className="block hover:text-white">Contact Us</Link>
              <Link href="/faq" className="block hover:text-white">FAQ</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/blog" className="block hover:text-white">Blog</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <div className="space-y-2 text-gray-300">
              <Link href="/privacy-policy" className="block hover:text-white">Privacy Policy</Link>
              <Link href="/terms-conditions" className="block hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-2xl font-bold text-white mb-2 block">Godbud.cc</Link>
            <p className="text-gray-400 text-sm">© {currentYear} Godbud.cc. All rights reserved.</p>
          </div>
          <img 
            src="/trust-badges.webp" 
            alt="Accepted payment methods: Norton Secured, SSL Certificate, PayPal, Credit Cards, Bitcoin"
            className="h-8 w-auto"
          />
        </div>
      </div>
    </footer>
  )
}

