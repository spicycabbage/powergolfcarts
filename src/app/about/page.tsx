import { Metadata } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const candidateSlugs = ['about', 'about-us']

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase()
    const page: any = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
    if (!page) return { 
      title: 'About Us',
      alternates: {
        canonical: '/about',
      },
    }
    return {
      title: page.seo?.title || page.title || 'About Us',
      description: page.seo?.description || '',
      alternates: {
        canonical: '/about',
      },
    }
  } catch {
    return { 
      title: 'About Us',
      alternates: {
        canonical: '/about',
      },
    }
  }
}

export default async function AboutPage() {
  try {
    await connectToDatabase()
    const page: any = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
    if (page) {
      return (
        <div className="min-h-screen bg-gray-50">
          <section className="bg-white border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
          </section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            </div>
          </div>
        </div>
      )
    }
  } catch {}

  // Fallback content when no CMS page exists
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 bg-white rounded-lg shadow-sm m-4">
          <div className="prose max-w-none text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Godbud.cc - Canada's Trusted Online Cannabis Dispensary</h2>
            
            <p className="text-lg leading-relaxed mb-6">
              Since 2019, Godbud.cc has been at the forefront of Canada's online cannabis industry, providing customers 
              across the country with access to premium cannabis products through our secure, user-friendly platform. 
              We've built our reputation on three core principles: exceptional product quality, outstanding customer 
              service, and competitive pricing that makes premium cannabis accessible to all Canadians.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="leading-relaxed mb-6">
              Our mission is to democratize access to high-quality cannabis products while educating our customers 
              about safe, responsible consumption. We believe that every Canadian should have access to premium 
              cannabis products, comprehensive product information, and expert guidance to make informed decisions 
              about their cannabis journey. Through our carefully curated selection and educational resources, we 
              empower our customers to explore the world of cannabis with confidence.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality You Can Trust</h3>
            <p className="leading-relaxed mb-6">
              Every product in our catalog undergoes rigorous quality assessment before reaching our customers. 
              We partner exclusively with licensed Canadian producers who share our commitment to excellence, 
              ensuring that every flower, concentrate, edible, and vape cartridge meets our strict standards for 
              potency, purity, and consistency. Our team personally tests and evaluates products to guarantee 
              that you receive only the finest cannabis available in Canada.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Product Selection</h3>
            <p className="leading-relaxed mb-6">
              Our extensive catalog features over 90 unique cannabis products spanning all major categories. From 
              premium BC flowers and artisanal concentrates to precisely dosed edibles and convenient vape cartridges, 
              we offer something for every preference and experience level. Whether you're seeking relaxation, 
              creativity, pain relief, or simply exploring cannabis for the first time, our diverse selection 
              ensures you'll find products that match your specific needs and goals.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Customer Support</h3>
            <p className="leading-relaxed mb-6">
              Our knowledgeable customer service team consists of cannabis enthusiasts and experts who understand 
              the nuances of different strains, consumption methods, and product categories. We're here to help 
              you navigate our selection, answer questions about products and effects, and provide personalized 
              recommendations based on your preferences and experience level. Your satisfaction and safety are 
              our top priorities.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure, Discreet Service</h3>
            <p className="leading-relaxed mb-6">
              We understand the importance of privacy and discretion when it comes to cannabis purchases. Our 
              secure ordering system protects your personal information, while our discreet packaging ensures 
              your privacy is maintained throughout the delivery process. We ship across Canada using reliable 
              carriers, with tracking information provided so you can monitor your order every step of the way.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Community and Education</h3>
            <p className="leading-relaxed">
              Beyond providing premium products, we're committed to building an informed cannabis community. 
              Our blog features educational articles, strain reviews, consumption guides, and industry insights 
              written by cannabis experts. We believe that education is the foundation of a positive cannabis 
              experience, and we're dedicated to providing the resources you need to make informed decisions 
              about cannabis consumption and product selection.
            </p>
          </div>
      </div>
    </div>
  )
}



