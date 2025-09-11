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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
          </section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none text-gray-800">
            <p>Welcome to our store. This page will be updated soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}



