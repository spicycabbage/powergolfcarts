import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Power Golf Carts',
  description: 'Privacy Policy for Power Golf Carts - How we collect, use, and protect your personal information',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: October 2025</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 prose max-w-none">
          <h2>Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you create an account, 
            make a purchase, or contact customer support. This may include your name, email address, 
            shipping address, and payment information.
          </p>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and account</li>
            <li>Send you promotional emails (with your consent)</li>
            <li>Improve our website and customer service</li>
            <li>Prevent fraud and maintain security</li>
          </ul>
          
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information with service providers who help us operate our business, 
            such as payment processors and shipping companies.
          </p>
          
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from 
            unauthorized access, disclosure, alteration, or destruction.
          </p>
          
          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. 
            You may also opt out of marketing communications at any time.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@powergolfcarts.com
          </p>
        </div>
      </div>
    </div>
  )
}

