import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import BlogSidebar from '@/components/blog/BlogSidebar'
import { sanitizeHtml } from '@/utils/sanitize'

export const dynamic = 'force-dynamic'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  await connectToDatabase()
  const post: any = await Post.findOne({ slug, isPublished: true }).lean()
  if (!post) return { title: 'Post' }
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || '',
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params
  await connectToDatabase()
  const post: any = await Post.findOne({ slug, isPublished: true }).lean()
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="w-full h-auto rounded-lg mb-8" />
        )}
        {post.excerpt && (
          <p className="text-lg text-gray-700 mb-6">{post.excerpt}</p>
        )}
        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }} />
        </div>
        <div>
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}


