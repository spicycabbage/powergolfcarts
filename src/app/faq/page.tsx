import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'
import FAQSchema from '@/components/seo/FAQSchema'
import FAQAccordion from '@/components/FAQAccordion'

export const dynamic = 'force-dynamic'

const candidateSlugs = ['faq', 'faqs']

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase()
  const page: any = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
  if (!page) return {
    title: 'FAQ | Godbud.cc',
    alternates: {
      canonical: '/faq',
    },
  }
  return {
    title: page.seo?.title || `${page.title} | Godbud.cc`,
    description: page.seo?.description || '',
    alternates: {
      canonical: '/faq',
    },
  }
}

export default async function FAQPage() {
  await connectToDatabase()
  const page: any = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
  if (!page) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FAQ Schema for SEO */}
      <FAQSchema 
        htmlContent={page.content || ''} 
        pageUrl="https://www.godbud.cc/faq"
      />
      
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <FAQAccordion htmlContent={page.content || ''} />
        </div>
      </div>
    </div>
  )
}



