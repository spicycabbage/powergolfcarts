'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Country, Currency, GeoLocation, detectUserLocationClient } from '@/lib/geoDetection'

interface CurrencyContextType {
  location: GeoLocation
  setLocation: (location: GeoLocation) => void
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
        
        // Store in localStorage for future visits
        localStorage.setItem('user-location', JSON.stringify(detectedLocation))
      })
    } else {
      setIsLoading(false)
    }
  }, [initialLocation])

  // Load saved location from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('user-location')
      if (savedLocation && !initialLocation) {
        try {
          const parsed = JSON.parse(savedLocation)
          setLocation(parsed)
          setIsLoading(false)
        } catch (error) {
          console.warn('Failed to parse saved location:', error)
        }
      }
    }
  }, [initialLocation])

  const value: CurrencyContextType = {
    location,
    setLocation: (newLocation) => {
      setLocation(newLocation)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-location', JSON.stringify(newLocation))
      }
    },
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
