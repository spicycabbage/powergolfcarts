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
      title: `${tagTitle} Posts | Godbud.cc Blog`,
      description: `Latest posts about ${tagTitle.toLowerCase()}`,
      alternates: {
        canonical: `/blog?tag=${tag}`,
      },
    }
  }
  
  return {
    title: 'Blog | Godbud.cc',
    description: 'Latest updates, guides, and news',
    alternates: {
      canonical: '/blog',
    },
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
            {tag ? `${tagTitle} Posts` : 'Cannabis Blog'}
          </h1>
          <p className="text-gray-600 mt-2">
            {tag ? `Posts about ${tag.toLowerCase()}` : 'Expert insights, tips, and news about cannabis'}
          </p>
          
          {/* Dynamic content based on tag */}
          <div className="mt-6 prose max-w-none text-gray-700">
            {tag ? (
              <>
                <p>
                  Explore our comprehensive collection of cannabis articles related to <strong>{tagTitle}</strong>. 
                  At Godbud.cc, we provide in-depth information about cannabis strains, consumption methods, 
                  effects, and everything you need to know about {tag.toLowerCase()}-related cannabis topics in Canada.
                </p>
                <p>
                  Our expert team regularly publishes detailed articles covering {tag.toLowerCase()} and related cannabis topics, 
                  including strain genetics, terpene profiles, cannabinoid effects, consumption techniques, dosage guidelines, 
                  and the latest developments in the Canadian cannabis industry. Whether you're researching {tag.toLowerCase()} 
                  specifically or exploring related cannabis topics, our blog provides valuable insights to enhance your knowledge.
                </p>
                <p>
                  Browse through our {tag.toLowerCase()}-related articles below to discover detailed information about cannabis 
                  products, strain reviews, consumption tips, and industry news. Each article about {tag.toLowerCase()} is 
                  carefully researched and written to provide accurate, helpful information for cannabis enthusiasts across Canada. 
                  Learn about the specific characteristics, effects, and applications of {tag.toLowerCase()} in the cannabis world.
                </p>
                <p>
                  Understanding {tag.toLowerCase()} is essential for making informed decisions about cannabis products. 
                  Our articles explore how {tag.toLowerCase()} relates to different cannabis strains, consumption methods, 
                  and user experiences. From beginner-friendly explanations to advanced topics about {tag.toLowerCase()}, 
                  we cover all aspects to help you understand this important cannabis topic.
                </p>
              </>
            ) : (
              <>
                <p>
                  Welcome to the Godbud.cc cannabis blog, your trusted source for comprehensive information about 
                  cannabis products, strains, consumption methods, and industry news in Canada. Our expert team 
                  provides detailed articles covering everything from beginner guides to advanced cannabis topics.
                </p>
                <p>
                  Discover in-depth strain reviews, learn about different consumption methods, understand terpene 
                  profiles and cannabinoid effects, and stay updated with the latest developments in the Canadian 
                  cannabis market. Our blog covers topics including indica vs sativa differences, hybrid strain 
                  characteristics, edible dosage guidelines, vaporization techniques, and much more.
                </p>
                <p>
                  Whether you're looking for information about specific cannabis strains, want to learn about 
                  different consumption methods, or need guidance on dosage and effects, our comprehensive blog 
                  articles provide the knowledge you need to make informed decisions about cannabis products.
                </p>
                <p>
                  Our cannabis blog features expert insights on strain genetics, cultivation techniques, consumption 
                  safety, legal considerations in Canada, and product reviews. We regularly update our content with 
                  the latest research, industry trends, and user experiences to ensure you have access to current 
                  and accurate cannabis information.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((p: any, index: number) => (
              <article key={String(p._id)} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-6">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-48 h-32 md:w-60 md:h-40 rounded object-cover flex-shrink-0"
                      loading={index === 0 ? 'eager' : 'lazy'}
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

        {/* Additional content section for SEO */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {tag ? `More About ${tagTitle} in Cannabis` : 'Cannabis Education & Resources'}
          </h2>
          <div className="prose max-w-none text-gray-700">
            {tag ? (
              <>
                <p>
                  When exploring {tag.toLowerCase()} in the context of cannabis, it's important to understand how this topic 
                  relates to the broader cannabis experience. At Godbud.cc, we believe that comprehensive education about 
                  {tag.toLowerCase()} helps our customers make better-informed decisions about their cannabis purchases and consumption.
                </p>
                <p>
                  The relationship between {tag.toLowerCase()} and cannabis effects, strain characteristics, and consumption methods 
                  is complex and varies depending on individual factors such as tolerance, body chemistry, and experience level. 
                  Our detailed articles about {tag.toLowerCase()} explore these nuances to provide you with practical, actionable information.
                </p>
                <p>
                  Whether you're interested in {tag.toLowerCase()} for recreational or therapeutic purposes, understanding the 
                  science behind cannabis and how {tag.toLowerCase()} fits into the larger picture is essential. Our expert-written 
                  content covers everything from basic concepts to advanced topics related to {tag.toLowerCase()} and cannabis.
                </p>
              </>
            ) : (
              <>
                <p>
                  Cannabis education is at the heart of what we do at Godbud.cc. Our comprehensive blog covers all aspects of 
                  cannabis, from strain genetics and terpene profiles to consumption methods and dosage guidelines. We believe 
                  that informed consumers have better experiences and make safer choices.
                </p>
                <p>
                  Our team of cannabis experts regularly researches and writes about the latest developments in cannabis science, 
                  industry trends, and product innovations. We cover topics ranging from the basics of cannabis biology to 
                  advanced discussions about cannabinoid interactions and therapeutic applications.
                </p>
                <p>
                  Explore our extensive library of cannabis articles to deepen your understanding of this fascinating plant. 
                  Whether you're a newcomer to cannabis or an experienced enthusiast, our blog provides valuable insights to 
                  enhance your knowledge and improve your cannabis experience.
                </p>
              </>
            )}
          </div>
        </div>

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


