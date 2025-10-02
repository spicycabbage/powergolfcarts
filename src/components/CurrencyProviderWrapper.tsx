import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { detectUserLocationServer } from '@/lib/serverGeoDetection'

interface CurrencyProviderWrapperProps {
  children: React.ReactNode
}

export async function CurrencyProviderWrapper({ children }: CurrencyProviderWrapperProps) {
  // Detect user location on the server side
  const initialLocation = await detectUserLocationServer()
  
  return (
    <CurrencyProvider initialLocation={initialLocation}>
      {children}
    </CurrencyProvider>
  )
}
