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
        title: `${tagTitle} Posts | Power Golf Carts Blog`,
        description: `Latest posts about ${tagTitle.toLowerCase()} in golf`,
        alternates: {
          canonical: `/blog?tag=${tag}`,
        },
      }
  }
  
    return {
      title: 'Blog | Power Golf Carts',
      description: 'Latest updates, guides, and news about electric golf carts and golf equipment',
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
            {tag ? `${tagTitle} Posts` : 'Golf Blog'}
          </h1>
          <p className="text-gray-600 mt-2">
            {tag ? `Posts about ${tag.toLowerCase()}` : 'Expert insights, tips, and news about golf and electric golf caddies'}
          </p>
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

        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {tag ? `Complete Guide to ${tagTitle} in Golf` : 'Complete Golf Education Guide'}
          </h2>
          <div className="prose max-w-none text-gray-700 space-y-4">
            {tag ? (
              <>
                <p>
                  Understanding {tag.toLowerCase()} in golf requires comprehensive knowledge of how different equipment, techniques, and course conditions interact to create optimal playing experiences. At Insanity Golf, we've compiled extensive research and expert insights to help golfers make informed decisions about {tag.toLowerCase()}-related equipment and playing strategies.
                </p>
                <p>
                  The science behind {tag.toLowerCase()} and golf involves complex interactions between club technology, ball physics, swing mechanics, and course conditions. Our detailed articles explore how {tag.toLowerCase()} manifests differently across various golf equipment and playing styles, providing practical guidance for both recreational and competitive golfers.
                </p>
                <p>
                  Golf equipment associated with {tag.toLowerCase()} often features specific technological innovations that contribute to performance. For example, clubs with advanced face technology may promote better ball speed, while those with optimized weight distribution tend to provide more consistent accuracy. Understanding these relationships helps golfers select equipment that aligns with their desired {tag.toLowerCase()} experience.
                </p>
                <p>
                  Playing conditions significantly impact how {tag.toLowerCase()} performance manifests. Course conditions, weather, and terrain all affect equipment performance and playing strategy. Understanding how to adapt your {tag.toLowerCase()} approach to different conditions is essential for consistent performance across various golf courses and weather scenarios.
                </p>
                <p>
                  Equipment selection for {tag.toLowerCase()}-focused golf varies dramatically between individual playing styles and skill levels. New golfers should start with forgiving equipment designed for improvement, while experienced players may require precision equipment for competitive play. Understanding your skill level and playing goals helps ensure equipment choices support your {tag.toLowerCase()} objectives.
                </p>
                <p>
                  Quality golf equipment undergoes rigorous testing for durability, performance, and safety, ensuring reliable performance for {tag.toLowerCase()} purposes. Reputable manufacturers provide detailed specifications and performance data, helping golfers make informed choices about equipment that supports their {tag.toLowerCase()} goals while maintaining quality and reliability standards.
                </p>
                <p>
                  The golf equipment market offers diverse product categories for {tag.toLowerCase()} applications, including clubs, balls, bags, accessories, and electric golf caddies. Each category provides unique advantages: clubs offer precision and power, balls provide distance and control, bags deliver organization and convenience, and electric caddies offer mobility and course navigation assistance.
                </p>
                <p>
                  Maintenance and care practices significantly impact golf equipment quality and {tag.toLowerCase()} effectiveness. Proper storage in dry, temperature-controlled environments preserves equipment performance and longevity. Regular cleaning and inspection prevent damage, while proper handling techniques ensure consistent performance. Well-maintained equipment provides optimal {tag.toLowerCase()} experiences compared to neglected gear.
                </p>
              </>
            ) : (
              <>
                <p>
                  Golf education encompasses understanding the complex relationships between equipment technology, swing mechanics, course management, and individual playing factors that determine performance outcomes. At Insanity Golf, we provide comprehensive information about golf science, equipment selection, playing techniques, and course strategies to help golfers make informed decisions about their golf journey.
                </p>
                <p>
                  Modern golf equipment incorporates advanced materials and engineering to optimize performance across different playing conditions. Club technology focuses on maximizing ball speed, improving accuracy, and enhancing forgiveness, while ball design emphasizes distance, control, and feel. Understanding these technological innovations helps golfers select equipment that matches their playing style and skill level.
                </p>
                <p>
                  Golf equipment categories provide general guidance about intended use, but modern technology has created versatile products that serve multiple purposes. Drivers are designed for maximum distance off the tee, irons provide precision for approach shots, wedges offer control around the green, and putters deliver accuracy on the putting surface. Understanding each category's strengths helps golfers build complete equipment sets.
                </p>
                <p>
                  Course conditions significantly influence equipment selection and playing strategy. Firm, fast conditions may favor lower-lofted clubs and firmer golf balls, while soft, wet conditions might require higher-lofted clubs and softer balls. Understanding how equipment interacts with course conditions helps golfers adapt their approach for optimal performance in various playing environments.
                </p>
                <p>
                  Playing techniques dramatically affect equipment performance and shot outcomes. Proper swing mechanics maximize equipment potential, while poor technique can negate even the best equipment advantages. Understanding fundamental swing principles, course management strategies, and mental game techniques helps golfers optimize their equipment investment and improve overall performance.
                </p>
                <p>
                  Equipment fitting guidelines vary significantly based on individual physical characteristics, swing mechanics, and playing goals. Proper fitting ensures equipment matches your swing characteristics, while poor fitting can hinder performance regardless of equipment quality. Professional fitting services help golfers select equipment that optimizes their natural abilities and playing style.
                </p>
                <p>
                  The golf industry maintains high standards for equipment quality through rigorous testing, certification processes, and performance standards. Reputable manufacturers conduct extensive testing for durability, performance, and safety, ensuring equipment meets professional standards. Understanding quality indicators and manufacturer reputations helps golfers make informed purchasing decisions.
                </p>
                <p>
                  The golf equipment market offers diverse product categories including clubs (drivers, irons, wedges, putters), golf balls, bags and accessories, electric golf caddies, and training aids. Each category serves different playing needs: clubs provide shot-making tools, balls deliver performance characteristics, bags offer organization and transport, electric caddies provide course navigation and equipment transport, and training aids support skill development.
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


