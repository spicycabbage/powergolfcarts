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

        {/* Comprehensive content section for better text-to-HTML ratio */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {tag ? `Complete Guide to ${tagTitle} in Cannabis` : 'Complete Cannabis Education Guide'}
          </h2>
          <div className="prose max-w-none text-gray-700 space-y-4">
            {tag ? (
              <>
                <p>
                  Understanding {tag.toLowerCase()} in cannabis requires comprehensive knowledge of how different strains, consumption methods, and individual factors interact to create unique experiences. At Godbud.cc, we've compiled extensive research and expert insights to help Canadian cannabis consumers make informed decisions about {tag.toLowerCase()}-related products and consumption practices.
                </p>
                <p>
                  The science behind {tag.toLowerCase()} and cannabis involves complex interactions between cannabinoids like THC and CBD, terpenes that provide aroma and flavor profiles, and individual factors such as tolerance, body weight, metabolism, and previous cannabis experience. Our detailed articles explore how {tag.toLowerCase()} manifests differently across indica, sativa, and hybrid strains, providing practical guidance for both recreational and medical cannabis users.
                </p>
                <p>
                  Cannabis strains associated with {tag.toLowerCase()} often feature specific terpene profiles that contribute to their effects. For example, strains high in limonene may promote uplifting effects, while those rich in myrcene tend to be more relaxing. Understanding these relationships helps consumers select products that align with their desired {tag.toLowerCase()} experience, whether they're seeking daytime functionality or evening relaxation.
                </p>
                <p>
                  Consumption methods significantly impact how {tag.toLowerCase()} effects manifest. Smoking and vaporizing provide rapid onset but shorter duration, making them ideal for immediate {tag.toLowerCase()} needs. Edibles offer longer-lasting effects but require patience due to delayed onset. Tinctures and oils provide middle-ground options with moderate onset times and duration, perfect for consistent {tag.toLowerCase()} maintenance throughout the day.
                </p>
                <p>
                  Dosage considerations for {tag.toLowerCase()}-focused cannabis use vary dramatically between individuals and consumption methods. New users should start with minimal doses (2.5-5mg THC for edibles, single small inhalations for smoking) and gradually increase until desired {tag.toLowerCase()} effects are achieved. Experienced users may require higher doses but should always consider tolerance breaks to maintain effectiveness and reduce potential side effects.
                </p>
                <p>
                  Legal cannabis products in Canada undergo rigorous testing for potency, pesticides, heavy metals, and microbials, ensuring safe consumption for {tag.toLowerCase()} purposes. Licensed producers must provide detailed cannabinoid and terpene profiles, helping consumers make informed choices about products that support their {tag.toLowerCase()} goals while maintaining safety and quality standards.
                </p>
                <p>
                  The Canadian cannabis market offers diverse product categories for {tag.toLowerCase()} applications, including dried flower, pre-rolls, concentrates, edibles, beverages, topicals, and accessories. Each category provides unique advantages: flower offers full-spectrum effects, concentrates provide potent experiences, edibles deliver long-lasting relief, and topicals offer localized benefits without psychoactive effects.
                </p>
                <p>
                  Storage and handling practices significantly impact cannabis quality and {tag.toLowerCase()} effectiveness. Proper storage in cool, dark, dry environments preserves cannabinoid potency and terpene profiles. Glass containers with airtight seals prevent degradation, while avoiding plastic containers prevents static buildup and terpene absorption. Fresh cannabis provides optimal {tag.toLowerCase()} experiences compared to degraded products.
                </p>
              </>
            ) : (
              <>
                <p>
                  Cannabis education encompasses understanding the complex relationships between plant genetics, cannabinoid profiles, terpene compositions, and individual physiological factors that determine user experiences. At Godbud.cc, we provide comprehensive information about cannabis science, consumption methods, strain characteristics, and safety considerations to help Canadian consumers make informed decisions about their cannabis journey.
                </p>
                <p>
                  The cannabis plant contains over 100 cannabinoids and 200 terpenes that work together through the entourage effect to create unique therapeutic and recreational experiences. THC (tetrahydrocannabinol) provides psychoactive effects, while CBD (cannabidiol) offers therapeutic benefits without intoxication. Minor cannabinoids like CBG, CBN, and CBC contribute additional effects, creating the complex profiles that distinguish different strains and products.
                </p>
                <p>
                  Indica, sativa, and hybrid classifications provide general guidance about potential effects, but modern cannabis breeding has created diverse strains that don't always conform to traditional categories. Indica strains typically offer relaxing, body-focused effects ideal for evening use, while sativa strains tend to provide energizing, cerebral experiences suitable for daytime activities. Hybrid strains combine characteristics from both categories, offering balanced effects.
                </p>
                <p>
                  Terpenes significantly influence cannabis effects and flavors, with each compound contributing unique characteristics. Myrcene promotes relaxation and sedation, limonene provides mood elevation and stress relief, pinene enhances alertness and memory retention, linalool offers calming and anti-anxiety effects, and caryophyllene provides anti-inflammatory benefits. Understanding terpene profiles helps consumers select strains that match their desired outcomes.
                </p>
                <p>
                  Consumption methods dramatically affect onset time, duration, and intensity of cannabis effects. Inhalation methods (smoking, vaporizing) provide rapid onset within minutes but shorter duration of 1-3 hours. Oral consumption (edibles, beverages) requires 30-120 minutes for onset but provides effects lasting 4-8 hours. Sublingual administration offers middle-ground timing with 15-45 minute onset and 2-4 hour duration.
                </p>
                <p>
                  Dosage guidelines vary significantly based on individual tolerance, body weight, metabolism, and desired effects. New users should follow the "start low, go slow" principle, beginning with 2.5-5mg THC for edibles or single small inhalations for smoking. Experienced users may require higher doses but should consider tolerance breaks to maintain effectiveness and prevent dependence or adverse effects.
                </p>
                <p>
                  Canada's legal cannabis framework ensures product safety through mandatory testing, standardized packaging, and licensed production facilities. All legal cannabis products undergo testing for potency, pesticides, heavy metals, microbials, and residual solvents. Licensed producers must provide accurate labeling with cannabinoid content, allowing consumers to make informed purchasing decisions based on their needs and preferences.
                </p>
                <p>
                  The Canadian cannabis market offers diverse product categories including dried flower, pre-rolls, concentrates (shatter, wax, live resin), edibles (gummies, chocolates, beverages), oils and tinctures, topicals, and accessories. Each category serves different consumer needs: flower provides traditional experiences, concentrates offer potency, edibles deliver convenience, oils enable precise dosing, and topicals provide localized relief without psychoactive effects.
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


