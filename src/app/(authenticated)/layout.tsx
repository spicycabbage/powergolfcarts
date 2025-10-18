import { SessionProvider } from '@/components/SessionProvider'
import { Providers } from '@/components/Providers'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import HeaderServer from '@/components/layout/HeaderServer'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Providers>
        <div className="min-h-screen flex flex-col">
          <HeaderServer />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </div>
      </Providers>
    </SessionProvider>
  )
}

