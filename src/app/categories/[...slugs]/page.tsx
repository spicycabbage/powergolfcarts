import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'
import { getSiteConfig } from '@/lib/config'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'

type Params = { slugs: string[] }

async function findCategoryByPath(slugs: string[]) {
  await connectToDatabase()

  let parentId: any = null
  const chain: Array<{ _id: string; name: string; slug: string }> = []

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const query: any = { slug }
    if (i === 0) {
      query.parent = null
    } else {
      query.parent = parentId
    }
    const doc = await Category.findOne(query).select('_id name slug description image parent').lean()
    if (!doc) return null
    chain.push({ _id: String((doc as any)._id), name: (doc as any).name, slug: (doc as any).slug })
    parentId = (doc as any)._id
  }

  // Return the final category and the full chain for breadcrumbs
  const current = await Category.findById(parentId).select('_id name slug description image').lean()
  if (!current) return null
  return { current, chain }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slugs } = await params
  const slugsArray = Array.isArray(slugs) ? slugs : []
  const result = await findCategoryByPath(slugsArray)
  if (!result) {
    return { title: 'Category Not Found | E-Commerce Store' }
  }
  const titleChain = result.chain.map(s => s.name).join(' / ')
  return {
    title: `${titleChain} | E-Commerce Store`,
    description: (result.current as any).description || `Shop ${(result.current as any).name} products`,
  }
}

export default async function NestedCategoryPage({ params }: { params: Promise<Params> }) {
  const { slugs } = await params
  const slugsArray = Array.isArray(slugs) ? slugs : []
  const result = await findCategoryByPath(slugsArray)
  if (!result) notFound()

  const { current, chain } = result

  // Build breadcrumb hrefs progressively
  const segments: Array<{ name: string; href: string }> = []
  let path = '/categories'
  for (const part of chain) {
    path += `/${part.slug}`
    segments.push({ name: part.name, href: path })
  }

  const cfg = getSiteConfig()
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`
  const crumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Categories', item: `${baseUrl}/categories` },
    ...segments.map(s => ({ name: s.name, item: `${baseUrl}${s.href}` })),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbsJsonLd crumbs={crumbs} />
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-primary-600">Categories</Link>
            {segments.map((s, i) => (
              <span key={s.href} className="flex items-center space-x-2">
                <span>/</span>
                {i < segments.length - 1 ? (
                  <Link href={s.href} className="hover:text-primary-600">{s.name}</Link>
                ) : (
                  <span className="text-gray-900 font-medium">{s.name}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{(current as any).name}</h1>
          {(current as any).description && (
            <p className="text-gray-600">{(current as any).description}</p>
          )}
        </div>
      </section>

      {/* TODO: Render products that include this category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Products listing for this category will appear here.</p>
      </div>
    </div>
  )
}


