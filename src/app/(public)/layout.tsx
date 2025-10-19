import { Footer } from '@/components/layout/Footer'
import { SimpleHeader } from '@/components/layout/SimpleHeader'
import { PublicProviders } from '@/components/PublicProviders'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicProviders>
      <div className="min-h-screen flex flex-col">
        <SimpleHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PublicProviders>
  )
}

