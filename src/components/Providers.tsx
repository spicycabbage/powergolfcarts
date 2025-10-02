'use client'

import { ReactNode, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ReferralProvider } from './providers/ReferralProvider'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { detectUserLocation } from '@/lib/geoDetection'

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

export async function Providers({ children }: ProvidersProps) {
  // Detect user location on the server side
  const initialLocation = await detectUserLocation()
  
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div />}>
        <CurrencyProvider initialLocation={initialLocation}>
          <ReferralProvider>
            {children}
            <HotToaster position="top-right" toastOptions={{ duration: 2500 }} />
          </ReferralProvider>
        </CurrencyProvider>
      </Suspense>
    </QueryClientProvider>
  )
}

