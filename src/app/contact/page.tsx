import { Metadata } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'
import ContactForm from '@/components/ContactForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const candidateSlugs = ['contact', 'contact-us']

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase()
    const page = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean<any>()
    if (!page) return { 
      title: 'Contact',
      alternates: {
        canonical: '/contact',
      },
    }
    return {
      title: page.seo?.title || page.title || 'Contact',
      description: page.seo?.description || '',
      alternates: {
        canonical: '/contact',
      },
    }
  } catch {
    return { 
      title: 'Contact',
      alternates: {
        canonical: '/contact',
      },
    }
  }
}

export default async function ContactPage() {
  try {
    await connectToDatabase()
    const page = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean<any>()
    if (page) {
      return (
        <div className="min-h-screen bg-gray-50">
          <section className="bg-white border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
          </section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose max-w-none text-gray-800 mb-8" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
              <ContactForm />
            </div>
          </div>
        </div>
      )
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-lg shadow-sm m-4">
          <div className="prose max-w-none text-gray-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch with Godbud.cc</h2>
            
            <p className="text-lg leading-relaxed mb-6">
              We're here to help with all your cannabis-related questions and concerns. Whether you need product 
              recommendations, have questions about your order, or want to learn more about our services, our 
              knowledgeable customer service team is ready to assist you. We pride ourselves on providing prompt, 
              helpful responses to ensure you have the best possible experience with Godbud.cc.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Can Help</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Product Recommendations:</strong> Our experts can help you find the perfect cannabis products based on your preferences, experience level, and desired effects.</li>
              <li><strong>Order Support:</strong> Questions about your order status, shipping, or delivery? We're here to provide updates and resolve any issues.</li>
              <li><strong>Product Information:</strong> Need detailed information about strains, potency, consumption methods, or effects? Our team has the knowledge you need.</li>
              <li><strong>Account Assistance:</strong> Help with account setup, password resets, or managing your profile and preferences.</li>
              <li><strong>General Inquiries:</strong> Any other questions about our services, policies, or the cannabis industry in Canada.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Times</h3>
            <p className="leading-relaxed mb-6">
              We typically respond to all inquiries within 24 hours during business days. For urgent order-related 
              questions, we aim to respond even faster. Our customer service team is available Monday through Friday, 
              and we monitor messages regularly to ensure you receive timely assistance. During peak periods or 
              holidays, response times may be slightly longer, but we always strive to get back to you as quickly 
              as possible.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy and Security</h3>
            <p className="leading-relaxed mb-6">
              Your privacy is important to us. All communications through our contact form are secure and confidential. 
              We never share your personal information with third parties, and all inquiries are handled by our 
              trained customer service team. Whether you're asking about products, placing an order, or need support, 
              you can trust that your information remains private and secure.
            </p>
            
            <p className="leading-relaxed mb-8">
              Use the form below to send us a message, and we'll get back to you as soon as possible. Please provide 
              as much detail as possible about your inquiry so we can give you the most helpful and accurate response.
            </p>
          </div>
          <ContactForm />
      </div>
    </div>
  )
}


