'use client'

import { ReactNode, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ReferralProvider } from './providers/ReferralProvider'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

interface ProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div />}>
        <CurrencyProvider>
          <ReferralProvider>
            {children}
            <HotToaster position="top-right" toastOptions={{ duration: 2500 }} />
          </ReferralProvider>
        </CurrencyProvider>
      </Suspense>
    </QueryClientProvider>
  )
}

