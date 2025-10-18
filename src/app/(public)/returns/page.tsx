import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Return Policy | Power Golf Carts',
  description: 'Learn about our return policy for electric golf carts and equipment. 30-day returns with specific terms and conditions.',
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Power Golf Carts wants to make sure all customers are happy with their purchase. If the E-Cart is completely unused and brand new in its original packaging and box, the buyer pays the return freight and a full refund will be issued.
            </p>

            <p className="text-gray-700 leading-relaxed">
              If the E-Cart has been used, the buyer pays the return freight and must ship with original box, we will charge a handling fee of $100 plus a 15% restocking fee. If custom purchased the open box items and final sale items will not be refunded. These charges cover the fee for checking and restocking the returned product. Also included in the charge is the original shipping cost by Federal Express, UPS or Loomis Express and credit card processing charges charged by the credit card processing company on both the original debit charge and the subsequent credit payment.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-amber-900 mb-3">Important Return Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>A return authorization must be obtained from Power Golf Carts on any returns made</li>
                <li>Items must be returned within 30 days of purchase</li>
                <li>If it's more than 30 days from order date, no refund will be issued</li>
                <li>Original packaging and box required for returns</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-red-900 mb-3">Items We Do Not Accept Returns For</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hazardous materials</li>
                <li>Non-original parts</li>
                <li>Damaged items</li>
                <li>Flammable liquids or gases</li>
                <li>Custom purchased open box items</li>
                <li>Final sale items</li>
              </ul>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                Please get in touch if you have questions or concerns about your specific item. Please contact us via email or telephone prior to returning any product.
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

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Contact Us About a Return
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

