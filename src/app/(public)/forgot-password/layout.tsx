import { SessionProvider } from '@/components/SessionProvider'

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

