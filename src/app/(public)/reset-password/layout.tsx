import { SessionProvider } from '@/components/SessionProvider'

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

