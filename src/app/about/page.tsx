import { Metadata } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'
import { sanitizeHtml } from '@/utils/sanitize'

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
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content || '') }} />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Insanity Golf - Premium Electric Golf Caddies</h2>
            
            <p className="text-lg leading-relaxed mb-6">
              Insanity Golf has been revolutionizing the golfing experience with our innovative electric golf caddies and E-Carts. 
              We've built our reputation on three core principles: cutting-edge technology, exceptional customer 
              service, and reliable products that enhance your golf game. Our mission is to make golf more 
              enjoyable and accessible for players of all skill levels.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="leading-relaxed mb-6">
              Our mission is to provide golfers with innovative electric caddy solutions that enhance their game 
              while reducing physical strain. We believe that every golfer should have access to premium E-Cart 
              technology, comprehensive product information, and expert guidance to make informed decisions 
              about their golf equipment. Through our carefully designed products and educational resources, we 
              empower golfers to enjoy their game with confidence and ease.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality You Can Trust</h3>
            <p className="leading-relaxed mb-6">
              Every E-Cart in our catalog undergoes rigorous testing and quality assessment before reaching our customers. 
              We partner exclusively with trusted manufacturers who share our commitment to excellence, 
              ensuring that every electric golf caddy meets our strict standards for performance, durability, 
              and reliability. Our team personally tests and evaluates products to guarantee 
              that you receive only the finest golf equipment available.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Product Selection</h3>
            <p className="leading-relaxed mb-6">
              Our extensive catalog features a wide range of electric golf caddies and E-Carts spanning all major categories. From 
              premium AI-powered caddies with obstacle detection to compact and durable models for easy transport, 
              we offer something for every preference and course condition. Whether you're seeking advanced features, 
              simple operation, or budget-friendly options, our diverse selection 
              ensures you'll find the perfect E-Cart that matches your specific needs and playing style.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Customer Support</h3>
            <p className="leading-relaxed mb-6">
              Our knowledgeable customer service team consists of golf enthusiasts and E-Cart experts who understand 
              the nuances of different models, course conditions, and technical specifications. We're here to help 
              you navigate our selection, answer questions about products and features, and provide personalized 
              recommendations based on your playing style and course requirements. Your satisfaction and golfing 
              experience are our top priorities.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reliable Service & Support</h3>
            <p className="leading-relaxed mb-6">
              We understand the importance of reliable equipment when it comes to your golf game. Our 
              secure ordering system protects your personal information, while our professional packaging ensures 
              your E-Cart arrives safely. We ship across Canada and the United States using reliable 
              carriers, with tracking information provided so you can monitor your order every step of the way.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Community and Education</h3>
            <p className="leading-relaxed">
              Beyond providing premium E-Carts, we're committed to building an informed golf community. 
              Our blog features educational articles, product reviews, maintenance guides, and industry insights 
              written by golf and technology experts. We believe that education is the foundation of a positive golfing 
              experience, and we're dedicated to providing the resources you need to make informed decisions 
              about electric golf caddy selection and maintenance.
            </p>
          </div>
      </div>
    </div>
  )
}



