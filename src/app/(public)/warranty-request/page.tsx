import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Warranty Request | Power Golf Carts',
  description: 'Submit a warranty request for your Power Golf Carts product',
  alternates: {
    canonical: '/warranty-request',
  },
}

export default function WarrantyRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Warranty Request</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-700 mb-6">
            To submit a warranty claim, please contact our customer service team with your order details and a description of the issue.
          </p>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-700">Email: support@powergolfcarts.com</p>
              <p className="text-gray-700">Phone: 1-800-GOLF-CART</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">What to Include</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Order number</li>
                <li>Product name and model</li>
                <li>Date of purchase</li>
                <li>Description of the issue</li>
                <li>Photos of the defect (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

