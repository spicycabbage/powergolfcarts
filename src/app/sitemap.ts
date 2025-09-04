import type { MetadataRoute } from 'next'
import { getSiteConfig } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cfg = getSiteConfig()
  const host = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`

  // TODO: replace with DB queries for products/categories when connected
  const staticRoutes = ['/', '/products', '/categories', '/about', '/faq', '/contact']

  const urls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${host}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  return urls
}


