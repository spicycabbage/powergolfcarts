import { Metadata } from 'next'
import Link from 'next/link'
import BlogSidebar from '@/components/blog/BlogSidebar'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const sp = await searchParams
  const tag = typeof sp?.tag === 'string' ? String(sp?.tag).toLowerCase() : ''
  
  if (tag) {
    const tagTitle = tag.charAt(0).toUpperCase() + tag.slice(1)
    return {
      title: `${tagTitle} - Blog`,
      description: `Latest posts about ${tagTitle.toLowerCase()}`,
    }
  }
  
  return {
    title: 'Blog',
    description: 'Latest updates, guides, and news',
  }
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  let posts: any[] = []
  let total = 0
  let tag = ''
  let page = 1
  const limit = 10
  try {
    await connectToDatabase()
    const sp = await searchParams
    const pageParam = (sp?.page as string) || '1'
    page = Math.max(parseInt(pageParam || '1', 10) || 1, 1)
    const skip = (page - 1) * limit
    tag = typeof sp?.tag === 'string' ? String(sp?.tag).toLowerCase() : ''
    const filter: any = { isPublished: true }
    if (tag) filter.tags = { $elemMatch: { $regex: `^${tag}$`, $options: 'i' } }
    const result = await Promise.all([
      Post.find(filter)
        .select('title slug excerpt tags coverImage publishedAt updatedAt')
        .sort({ publishedAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter)
    ])
    posts = result[0]
    total = result[1]
  } catch {}

  const totalPages = Math.max(Math.ceil(total / limit), 1)
  const tagTitle = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {tag ? `${tagTitle} - Blog` : 'Blog'}
          </h1>
          <p className="text-gray-600 mt-2">
            {tag ? `Posts about ${tagTitle.toLowerCase()}` : 'Read our latest posts and updates.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((p: any) => (
              <article key={String(p._id)} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-6">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-48 h-32 md:w-60 md:h-40 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <header className="mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        <Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}
                      </p>
                    </header>
                    {p.excerpt && (
                      <p className="text-gray-700 line-clamp-3">{p.excerpt}</p>
                    )}
                    {Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.tags.slice(0, 6).map((t: string) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Link href={`/blog/${p.slug}`} className="text-primary-600 hover:text-primary-700 font-medium">Read more →</Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-between">
            <Link href={`/blog?page=${Math.max(page - 1, 1)}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`} className={`px-4 py-2 border rounded-lg ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}>Previous</Link>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Link href={`/blog?page=${Math.min(page + 1, totalPages)}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`} className={`px-4 py-2 border rounded-lg ${page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}>Next</Link>
          </nav>
        )}
        </div>
        <div>
          <BlogSidebar activeTag={tag} />
        </div>
      </div>
    </div>
  )
}


