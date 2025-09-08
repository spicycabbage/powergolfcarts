import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Page from '@/lib/models/Page'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase()
  const page: any = await Page.findOne({ slug: 'about-us', isPublished: true }).lean()
  if (!page) return { title: 'About Us' }
  return {
    title: page.seo?.title || page.title || 'About Us',
    description: page.seo?.description || '',
  }
}

export default async function AboutUsPage() {
  await connectToDatabase()
  const page: any = await Page.findOne({ slug: 'about-us', isPublished: true }).lean()
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


