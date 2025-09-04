import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from '@/components/Providers'
import JsonLd from '@/components/seo/JsonLd'
import { getSiteConfig } from '@/lib/config'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import { SessionProvider } from '@/components/SessionProvider'
import HeaderServer from '@/components/layout/HeaderServer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'Your one-stop shop for quality products',
  keywords: 'ecommerce, shopping, online store, products',
  authors: [{ name: 'E-Commerce Store' }],
  creator: 'E-Commerce Store',
  publisher: 'E-Commerce Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'E-Commerce Store',
    description: 'Your one-stop shop for quality products',
    siteName: 'E-Commerce Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Commerce Store',
    description: 'Your one-stop shop for quality products',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛒</text></svg>',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global JSON-LD: Organization and Website */}
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: getSiteConfig().name,
              url: `https://${getSiteConfig().domain}`,
              logo: '/favicon.ico'
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: getSiteConfig().name,
              url: `https://${getSiteConfig().domain}`,
              potentialAction: {
                '@type': 'SearchAction',
                target: `https://${getSiteConfig().domain}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            }
          ]}
        />
        <SessionProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <HeaderServer />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
