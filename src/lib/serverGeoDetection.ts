import { headers } from 'next/headers'
import { GeoLocation, Country, Currency } from './geoDetection'

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
 * Detect user's country and currency based on IP address (Server-side only)
 * Uses Cloudflare's CF-IPCountry header when available
 * Falls back to US if detection fails
 */
export async function detectUserLocationServer(): Promise<GeoLocation> {
  try {
    // In server components, we can access headers
    const headersList = headers()
    const cfCountry = headersList.get('cf-ipcountry')
    
    if (cfCountry) {
      return mapCountryToLocation(cfCountry)
    }

    // Fallback: try to get IP from other headers
    const xForwardedFor = headersList.get('x-forwarded-for')
    const xRealIp = headersList.get('x-real-ip')
    const remoteAddr = headersList.get('remote-addr')
    
    const ip = xForwardedFor?.split(',')[0] || xRealIp || remoteAddr
    
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      // For development, we'll use a simple fallback
      // In production, you could call a geolocation API here
      return DEFAULT_LOCATION
    }

    return DEFAULT_LOCATION
  } catch (error) {
    console.warn('Failed to detect user location:', error)
    return DEFAULT_LOCATION
  }
}
