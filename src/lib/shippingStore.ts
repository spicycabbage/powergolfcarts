import { connectToDatabaseSafe } from '@/lib/mongodb'
import ShippingSettings from '@/lib/models/ShippingSettings'

let cachedShipping: any | null = null

export async function getShippingSettings(): Promise<any> {
  if (cachedShipping) return cachedShipping
  
  try {
    const db = await connectToDatabaseSafe()
    
    if (!db) {
      // Database not available, return default settings
      const defaultSettings = {
        freeShippingThreshold: 50,
        methods: [
          { name: 'Standard', price: 9.99, minDays: 3, maxDays: 7, isActive: true },
          { name: 'Express', price: 19.99, minDays: 1, maxDays: 2, isActive: true },
        ]
      }
      cachedShipping = defaultSettings
      return defaultSettings
    }
    
    let doc = await ShippingSettings.findOne().lean()
    if (!doc) {
      doc = (await ShippingSettings.create({
        freeShippingThreshold: 50,
        methods: [
          { name: 'Standard', price: 9.99, minDays: 3, maxDays: 7, isActive: true },
          { name: 'Express', price: 19.99, minDays: 1, maxDays: 2, isActive: true },
        ]
      })).toObject()
    }
    cachedShipping = JSON.parse(JSON.stringify(doc))
    return cachedShipping
  } catch (error) {
    console.error('Failed to get shipping settings:', error)
    // Return default settings if database connection fails
    const defaultSettings = {
      freeShippingThreshold: 50,
      methods: [
        { name: 'Standard', price: 9.99, minDays: 3, maxDays: 7, isActive: true },
        { name: 'Express', price: 19.99, minDays: 1, maxDays: 2, isActive: true },
      ]
    }
    cachedShipping = defaultSettings
    return defaultSettings
  }
}

export function setShippingSettings(data: any) {
  cachedShipping = JSON.parse(JSON.stringify(data))
}

export function clearShippingSettings() {
  cachedShipping = null
}


