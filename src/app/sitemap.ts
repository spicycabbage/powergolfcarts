import type { MetadataRoute } from 'next'
import { getSiteConfig } from '@/lib/config'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = getSiteConfig()
  const host = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`

  const staticRoutes = ['/', '/products', '/categories', '/about', '/faq', '/contact', '/blog']

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${host}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  // Blog posts
  try {
    await connectToDatabase()
    const posts = await Post.find({ isPublished: true }).select('slug updatedAt publishedAt').lean()
    const postUrls: MetadataRoute.Sitemap = posts.map((p: any) => ({
      url: `${host}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
    return [...staticUrls, ...postUrls]
  } catch {
    return staticUrls
  }
}


