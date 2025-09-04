import type { MetadataRoute } from 'next'
import { getSiteConfig } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  const cfg = getSiteConfig()
  const host = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: [`${host}/sitemap.xml`],
    host: host.replace(/\/$/, ''),
  }
}


