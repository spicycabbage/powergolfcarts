/** @type {import('next').NextConfig} */
const path = require('path')
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants')

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD

  return {
    experimental: {
      optimizePackageImports: ['lucide-react'],
    },
    outputFileTracingRoot: path.join(__dirname),
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
        },
      ],
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [150, 300, 600, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 300, 384, 400],
      qualities: [75, 85, 90, 95], // Add quality values to fix Next.js 16 warnings
      minimumCacheTTL: 31536000, // 1 year cache for optimized images
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // Skip DB and filesystem lookups during production build to keep builds fast and clean
      SKIP_DB_AT_BUILD: isProdBuild ? '1' : (process.env.SKIP_DB_AT_BUILD || ''),
    },
    async headers() {
      return [
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache',
            },
          ],
        },
      ]
    },
    async redirects() {
      return [
        {
          source: '/products/:slug/',
          destination: '/products/:slug',
          permanent: true,
        },
        {
          source: '/(.*)//',
          destination: '/$1/',
          permanent: true,
        },
      ]
    },
    async rewrites() {
      // No rewrites needed - sitemap.ts handles /sitemap.xml directly
      return []
    },
  }
}

