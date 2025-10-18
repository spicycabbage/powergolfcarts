import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Instruction Manuals | Power Golf Carts',
  description: 'Download user manuals and quick start guides for our electric golf carts including Robera Pro, Ego Caddy M5, Tasmania G2, and Volt Caddy.',
}

export default function ManualsPage() {
  const manuals = [
    {
      title: 'Robera Pro User Manual',
      description: 'Complete user manual for the Robera Pro AI-powered smart follow me cart with gesture control and obstacle avoidance.',
      filename: 'robera-pro-user-manual.pdf',
      productSlug: 'robera-pro',
      productName: 'Robera Pro',
    },
    {
      title: 'Ego Caddy M5 User Manual',
      description: 'Comprehensive guide for the Ego Caddy M5 smart follow me e-cart with app control and remote features.',
      filename: 'egocaddy-m5-user-manual.pdf',
      productSlug: 'ego-caddy-m5',
      productName: 'Ego Caddy M5',
    },
    {
      title: 'Tasmania G2 User Manual',
      description: 'User manual for the Tasmania G2 remote control e-cart with 360° swivel front wheel technology.',
      filename: 'tasmania-g2-user-manual.pdf',
      productSlug: 'tasmania-g2',
      productName: 'Tasmania G2',
    },
    {
      title: 'Volt Caddy Quick Start Guide',
      description: 'Quick start guide for the Volt Caddy with powerful dual motors and removable e-wheels.',
      filename: 'volt-caddy-quick-start-guide.pdf',
      productSlug: 'volt-caddy',
      productName: 'Volt Caddy',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Instruction Manuals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download user manuals and quick start guides for our electric golf carts. 
            Each manual includes setup instructions, features overview, and maintenance tips.
          </p>
        </div>

        {/* Manuals Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {manuals.map((manual, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {manual.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {manual.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <a
                    href={`/manuals/${manual.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Manual
                  </a>
                  <Link
                    href={`/products/${manual.productSlug}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View {manual.productName} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Additional Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/videos"
              className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="text-4xl mb-3">📹</div>
              <h3 className="font-bold text-gray-900 mb-2">Installation Videos</h3>
              <p className="text-sm text-gray-600">
                Watch step-by-step assembly guides
              </p>
            </Link>
            <Link
              href="/battery-care"
              className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="text-4xl mb-3">🔋</div>
              <h3 className="font-bold text-gray-900 mb-2">Battery Care</h3>
              <p className="text-sm text-gray-600">
                Learn how to maintain your battery
              </p>
            </Link>
            <Link
              href="/warranty"
              className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-bold text-gray-900 mb-2">Warranty Info</h3>
              <p className="text-sm text-gray-600">
                View warranty coverage details
              </p>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Need Additional Help?</h2>
          <p className="mb-6 text-green-50">
            If you have questions or need technical support, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@insanitygolf.ca"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              📧 Email Support
            </a>
            <a
              href="tel:1-778-861-8599"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900 transition-colors"
            >
              📞 Call Us: 1-778-861-8599
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

