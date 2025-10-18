import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bundle Products | Godbud.cc',
  description: 'Choose your bundle products and save with automatic discounts',
}

export default function BundleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Preload critical resources */}
      <link
        rel="preload"
        href="/api/bundles"
        as="fetch"
        crossOrigin="anonymous"
      />
      {children}
    </>
  )
}
