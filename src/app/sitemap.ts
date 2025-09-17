import type { MetadataRoute } from 'next'
import { getSiteConfig } from '@/lib/config'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = getSiteConfig()
  const host = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`

  const staticRoutes = ['/', '/products', '/categories', '/about', '/faq', '/contact', '/blog']

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${host}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  try {
    await connectToDatabase()
    
    // Blog posts
    const posts = await Post.find({ isPublished: true }).select('slug updatedAt publishedAt').lean()
    const postUrls: MetadataRoute.Sitemap = posts.map((p: any) => ({
      url: `${host}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    // Products
    const products = await Product.find({ isActive: true }).select('slug updatedAt').lean()
    const productUrls: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${host}/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Categories
    const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean()
    const categoryUrls: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${host}/categories/${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticUrls, ...postUrls, ...productUrls, ...categoryUrls]
  } catch {
    return staticUrls
  }
}


