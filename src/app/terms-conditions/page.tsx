import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Godbud.cc',
  description: 'Our terms and conditions outline the rules and regulations for using our website and services.',
}

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using this website, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials on our website 
                for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                The materials on our website are provided on an 'as is' basis. We make no warranties, 
                expressed or implied, and hereby disclaim and negate all other warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
              <p className="text-gray-700 mb-4">
                In no event shall our company or its suppliers be liable for any damages arising 
                out of the use or inability to use the materials on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Materials</h2>
              <p className="text-gray-700 mb-4">
                The materials appearing on our website could include technical, typographical, 
                or photographic errors. We do not warrant that any of the materials are accurate, 
                complete, or current.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms & Conditions, please contact us at{' '}
                <a href="/contact" className="text-primary-600 hover:text-primary-700">
                  our contact page
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
