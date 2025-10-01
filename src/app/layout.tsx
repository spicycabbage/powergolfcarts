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
  title: 'Insanity Golf',
  description: 'Premium electric golf caddies and E-Carts for effortless course navigation',
  keywords: 'golf equipment, electric golf caddy, e-cart, golf accessories, golf gear',
  authors: [{ name: 'Insanity Golf' }],
  creator: 'Insanity Golf',
  publisher: 'Insanity Golf',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.insanitygolf.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.insanitygolf.ca',
    title: 'Insanity Golf',
    description: 'Premium electric golf caddies and E-Carts for effortless course navigation',
    siteName: 'Insanity Golf',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insanity Golf',
    description: 'Premium electric golf caddies and E-Carts for effortless course navigation',
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
              '@id': 'https://www.insanitygolf.com/#organization',
              name: 'Insanity Golf',
              url: 'https://www.insanitygolf.com',
              logo: 'https://www.insanitygolf.com/favicon.ico',
              description: 'Premium golf equipment and accessories',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://www.insanitygolf.com/#website',
              name: 'Insanity Golf - Premium Golf Equipment',
              alternateName: 'Insanity Golf',
              url: 'https://www.insanitygolf.com',
              description: 'Premium golf equipment and accessories',
              publisher: {
                '@id': 'https://www.insanitygolf.com/#organization'
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.insanitygolf.com/categories?search={search_term_string}'
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
