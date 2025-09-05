import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'

export const dynamic = 'force-dynamic'

const candidateSlugs = ['faq', 'faqs']

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase()
  const page = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
  if (!page) return { title: 'FAQ' }
  return {
    title: page.seo?.title || page.title || 'FAQ',
    description: page.seo?.description || '',
  }
}

export default async function FAQPage() {
  await connectToDatabase()
  const page = await Page.findOne({ slug: { $in: candidateSlugs }, isPublished: true }).lean()
  if (!page) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      </div>
    </div>
  )
}



