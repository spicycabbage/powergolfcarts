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
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    async rewrites() {
      return [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
      ]
    },
  }
}

