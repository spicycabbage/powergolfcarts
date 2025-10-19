import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import JsonLd from '@/components/seo/JsonLd'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'block',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Power Golf Carts - Premium Electric Golf Carts & Equipment',
  description: 'Premium electric golf carts and golf equipment for effortless course navigation',
  keywords: 'electric golf carts, golf carts, golf equipment, golf accessories, golf gear, golf cart parts',
  authors: [{ name: 'Power Golf Carts' }],
  creator: 'Power Golf Carts',
  publisher: 'Power Golf Carts',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.powergolfcarts.shop'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.powergolfcarts.shop',
    title: 'Power Golf Carts',
    description: 'Premium electric golf carts and golf equipment for effortless course navigation',
    siteName: 'Power Golf Carts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Power Golf Carts',
    description: 'Premium electric golf carts and golf equipment for effortless course navigation',
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

export default function RootLayout({
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
              '@id': 'https://www.powergolfcarts.shop/#organization',
              name: 'Power Golf Carts',
              url: 'https://www.powergolfcarts.shop',
              logo: 'https://www.powergolfcarts.shop/power-golf-carts-black-2.jpg',
              description: 'Premium electric golf carts and golf equipment',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://www.powergolfcarts.shop/#website',
              name: 'Power Golf Carts - Premium Electric Golf Carts',
              alternateName: 'Power Golf Carts',
              url: 'https://www.powergolfcarts.shop',
              description: 'Premium electric golf carts and golf equipment',
              publisher: {
                '@id': 'https://www.powergolfcarts.shop/#organization'
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.powergolfcarts.shop/categories?search={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            }
          ]}
        />
        {children}
      </body>
    </html>
  )
}
