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
    if (!page) return { title: 'Contact' }
    return {
      title: page.seo?.title || page.title || 'Contact',
      description: page.seo?.description || '',
    }
  } catch {
    return { title: 'Contact' }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
          </section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="prose max-w-none text-gray-800 mb-8" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            <ContactForm />
          </div>
        </div>
      )
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose max-w-none text-gray-800 mb-8">Reach us via the form below.</div>
        <ContactForm />
      </div>
    </div>
  )
}


