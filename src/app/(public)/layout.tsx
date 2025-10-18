import { Footer } from '@/components/layout/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicProviders } from '@/components/PublicProviders'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicProviders>
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PublicProviders>
  )
}

