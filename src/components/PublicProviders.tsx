'use client'
import { ReactNode, Suspense } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as HotToaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

export function PublicProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div />}>
          <HotToaster position="top-right" toastOptions={{ duration: 2500 }} />
          {children}
        </Suspense>
      </QueryClientProvider>
    </SessionProvider>
  )
}

