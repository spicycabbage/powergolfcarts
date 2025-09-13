import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from '@/components/Providers'
import JsonLd from '@/components/seo/JsonLd'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import { SessionProvider } from '@/components/SessionProvider'
import HeaderServer from '@/components/layout/HeaderServer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Godbud.cc',
  description: 'Premium cannabis products delivered across Canada',
  keywords: 'ecommerce, shopping, online store, products',
  authors: [{ name: 'Godbud.cc' }],
  creator: 'Godbud.cc',
  publisher: 'Godbud.cc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.godbud.cc'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.godbud.cc',
    title: 'Godbud.cc',
    description: 'Premium cannabis products delivered across Canada',
    siteName: 'Godbud.cc',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Godbud.cc',
    description: 'Premium cannabis products delivered across Canada',
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
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://www.godbud.cc/#organization',
              name: 'Godbud.cc',
              url: 'https://www.godbud.cc',
              logo: 'https://www.godbud.cc/favicon.ico',
              description: 'Premium cannabis products delivered across Canada',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'CA'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://www.godbud.cc/#website',
              name: 'Godbud.cc - Buy Weed Online in Canada',
              alternateName: 'Godbud.cc',
              url: 'https://www.godbud.cc',
              description: 'Premium cannabis products delivered across Canada',
              publisher: {
                '@id': 'https://www.godbud.cc/#organization'
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.godbud.cc/categories?search={search_term_string}'
                },
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
