import { Metadata } from 'next'
import FAQAccordion from '@/components/FAQAccordion'

export const metadata: Metadata = {
  title: 'FAQ | Power Golf Carts',
  description: 'Frequently asked questions about Power Golf Carts, shipping, warranty, and technical support.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Power Golf Carts FAQ</h1>
          <p className="mt-2 text-gray-600">
            Find answers to common questions about our E-Carts, shipping, warranty, and technical support.
          </p>
        </div>
      </section>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <FAQAccordion />
        </div>
      </div>
    </div>
  )
}



