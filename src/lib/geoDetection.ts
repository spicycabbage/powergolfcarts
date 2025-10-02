export type Country = 'US' | 'CA' | 'OTHER'
export type Currency = 'USD' | 'CAD'

export interface GeoLocation {
  country: Country
  currency: Currency
  countryName: string
}

// Default fallback to US
const DEFAULT_LOCATION: GeoLocation = {
  country: 'US',
  currency: 'USD',
  countryName: 'United States'
}

/**
 * Map country code to location object
 */
function mapCountryToLocation(countryCode: string): GeoLocation {
  const upperCode = countryCode.toUpperCase()
  
  switch (upperCode) {
    case 'US':
      return {
        country: 'US',
        currency: 'USD',
        countryName: 'United States'
      }
    case 'CA':
      return {
        country: 'CA',
        currency: 'CAD',
        countryName: 'Canada'
      }
    default:
      // Default to US for other countries
      return DEFAULT_LOCATION
  }
}

/**
 * Client-side geolocation detection using browser APIs
 * Falls back to server detection if browser API fails
 */
export async function detectUserLocationClient(): Promise<GeoLocation> {
  try {
    // Try to get location from browser
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get country
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
              )
              const data = await response.json()
              const countryCode = data.countryCode
              resolve(mapCountryToLocation(countryCode))
            } catch {
              resolve(DEFAULT_LOCATION)
            }
          },
          () => resolve(DEFAULT_LOCATION),
          { timeout: 5000, enableHighAccuracy: false }
        )
      })
    }
    
    return DEFAULT_LOCATION
  } catch (error) {
    console.warn('Client-side geolocation failed:', error)
    return DEFAULT_LOCATION
  }
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'USD':
      return '$'
    case 'CAD':
      return 'C$'
    default:
      return '$'
  }
}

/**
 * Format price with appropriate currency symbol and formatting
 */
export function formatPrice(price: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency)
  
  // Use appropriate locale for number formatting
  const locale = currency === 'CAD' ? 'en-CA' : 'en-US'
  
  return `${symbol}${price.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
