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
  description: 'Your one-stop shop for quality products',
  keywords: 'ecommerce, shopping, online store, products',
  authors: [{ name: 'Godbud.cc' }],
  creator: 'Godbud.cc',
  publisher: 'Godbud.cc',
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
    title: 'Godbud.cc',
    description: 'Your one-stop shop for quality products',
    siteName: 'Godbud.cc',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Godbud.cc',
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
        {/* Auto warmup: run once per process after server starts */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if (typeof window==='undefined') return;
            if (window.__globalWarmed) return; window.__globalWarmed = true;
            try { fetch('/api/warmup', { cache: 'no-store' }); } catch(e){}
          })();
        `}} />
        {process.env.NODE_ENV !== 'production' && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              if (typeof window==='undefined') return;
              var reloaded = false;
              function maybeReload(msg){
                if (!reloaded && /ChunkLoadError|Loading chunk \\d+ failed/i.test(String(msg||''))) {
                  reloaded = true; try { sessionStorage.setItem('__chunk_reload__','1'); } catch(_){}
                  location.reload();
                }
              }
              window.addEventListener('error', function(e){
                maybeReload(e && (e.message || (e.error && (e.error.name||e.error.message))));
              }, true);
              window.addEventListener('unhandledrejection', function(e){
                var r = e && e.reason; maybeReload(r && (r.message || r));
              });
              try {
                if (sessionStorage.getItem('__chunk_reload__')==='1') { sessionStorage.removeItem('__chunk_reload__'); }
              } catch(_){}
            })();
          `}} />
        )}
        {/* Global JSON-LD: Organization and Website (env-based to avoid fs/dynamic at build) */}
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: process.env.NEXT_PUBLIC_SITE_NAME || 'Godbud.cc',
              url: `https://${process.env.NEXT_PUBLIC_DOMAIN || 'example.com'}`,
              logo: '/favicon.ico'
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: process.env.NEXT_PUBLIC_SITE_NAME || 'Godbud.cc',
              url: `https://${process.env.NEXT_PUBLIC_DOMAIN || 'example.com'}`,
              potentialAction: {
                '@type': 'SearchAction',
                target: `https://${process.env.NEXT_PUBLIC_DOMAIN || 'example.com'}/search?q={search_term_string}`,
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
