'use client'

import React from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Currency, Country } from '@/lib/geoDetection'

interface CurrencySwitcherProps {
  className?: string
  showCountry?: boolean
}

export default function CurrencySwitcher({ className = '', showCountry = true }: CurrencySwitcherProps) {
  const { location, setLocation, isLoading } = useCurrency()

  const handleCurrencyChange = (newCurrency: Currency) => {
    const newCountry: Country = newCurrency === 'USD' ? 'US' : 'CA'
    const countryName = newCurrency === 'USD' ? 'United States' : 'Canada'
    
    setLocation({
      country: newCountry,
      currency: newCurrency,
      countryName
    })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showCountry && (
        <span className="text-sm text-gray-600">
          {location.countryName}
        </span>
      )}
      
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleCurrencyChange('USD')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            location.currency === 'USD'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          USD
        </button>
        <button
          onClick={() => handleCurrencyChange('CAD')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            location.currency === 'CAD'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          CAD
        </button>
      </div>
    </div>
  )
}
