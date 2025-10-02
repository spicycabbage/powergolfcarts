'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Country, Currency, GeoLocation, detectUserLocationClient } from '@/lib/geoDetection'

interface CurrencyContextType {
  location: GeoLocation
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: React.ReactNode
  initialLocation?: GeoLocation
}

export function CurrencyProvider({ children, initialLocation }: CurrencyProviderProps) {
  const [location, setLocation] = useState<GeoLocation>(
    initialLocation || {
      country: 'US',
      currency: 'USD',
      countryName: 'United States'
    }
  )
  const [isLoading, setIsLoading] = useState(!initialLocation)

  useEffect(() => {
    // Only run client-side detection if no initial location was provided
    if (!initialLocation) {
      detectUserLocationClient().then((detectedLocation) => {
        setLocation(detectedLocation)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [initialLocation])

  const value: CurrencyContextType = {
    location,
    isLoading
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

// Hook for getting the current currency
export function useCurrentCurrency(): Currency {
  const { location } = useCurrency()
  return location.currency
}

// Hook for getting the current country
export function useCurrentCountry(): Country {
  const { location } = useCurrency()
  return location.country
}
