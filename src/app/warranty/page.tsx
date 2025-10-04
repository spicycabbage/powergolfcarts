import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Warranty Information | Power Golf Carts',
  description: 'Learn about our 1-year warranty coverage for electric golf carts, batteries, and chargers under normal usage conditions.',
}

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Warranty</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-green-900 mb-3">1 Year Warranty Coverage</h2>
              <p className="text-gray-700 leading-relaxed">
                Power Golf Carts will provide 1 year warranty from date of purchase on E-Cart, battery, charger under normal condition usage.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-red-900 mb-3">What Is NOT Covered</h2>
              <p className="text-gray-700 mb-4">
                The following are not covered by the warranty:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Any breakage caused by accidental damage</li>
                <li>Fall into water</li>
                <li>Physical damage of products</li>
                <li>Abuse or misuse</li>
                <li>Wear and tear parts (seat, cellphone holder, drink holder, umbrella holder, scorecard, remote control)</li>
                <li>Labour costs</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-amber-900 mb-3">Important Warranty Terms</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Warranties are non-transferable</strong> - valid only for original purchaser</li>
                <li><strong>Labour is not included</strong> - repair labour costs are customer responsibility</li>
                <li><strong>Normal usage conditions only</strong> - warranty applies to products used as intended</li>
                <li><strong>Wear and tear parts excluded</strong> - accessories and consumable parts not covered</li>
              </ul>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">Need Warranty Support?</h2>
              <p className="text-gray-700 mb-4">
                For any warranty issue, please contact us by email for any concerns.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:info@powergolfcarts.com" className="text-primary-600 hover:text-primary-700">
                    info@powergolfcarts.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Phone:</strong>{' '}
                  <a href="tel:1-778-861-8599" className="text-primary-600 hover:text-primary-700">
                    1-778-861-8599
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Text Support:</strong>{' '}
                  <a href="tel:1-604-319-4330" className="text-primary-600 hover:text-primary-700">
                    1-604-319-4330
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <Link 
                href="/warranty-request" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors mr-4"
              >
                Submit Warranty Request
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

