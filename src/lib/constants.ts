/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 10000,
  CACHE_TTL: {
    SHORT: 60000,      // 1 minute
    MEDIUM: 300000,    // 5 minutes
    LONG: 1800000,     // 30 minutes
    VERY_LONG: 3600000 // 1 hour
  }
} as const

// Product Configuration
export const PRODUCT_CONFIG = {
  DEFAULT_SORT: 'createdAt',
  SORT_OPTIONS: {
    NEWEST: 'createdAt',
    OLDEST: '-createdAt',
    PRICE_LOW: 'price',
    PRICE_HIGH: '-price',
    NAME_ASC: 'name',
    NAME_DESC: '-name',
    RATING: '-averageRating'
  },
  STOCK_STATUSES: {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
  },
  DEFAULT_LOW_STOCK_THRESHOLD: 5
} as const

// Image Configuration
export const IMAGE_CONFIG = {
  QUALITY: {
    LOW: 60,
    MEDIUM: 75,
    HIGH: 85,
    VERY_HIGH: 95
  },
  SIZES: {
    THUMBNAIL: 150,
    SMALL: 300,
    MEDIUM: 600,
    LARGE: 1200,
    EXTRA_LARGE: 1920
  },
  FORMATS: ['webp', 'jpg', 'png'] as const
} as const

// SEO Configuration
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Godbud.cc - Buy Weed Online in Canada',
  DEFAULT_DESCRIPTION: 'Premium cannabis products delivered across Canada. Shop flowers, edibles, concentrates, and more.',
  SITE_NAME: 'Godbud.cc',
  DOMAIN: 'https://www.godbud.cc',
  DEFAULT_IMAGE: '/og-image.jpg',
  MAX_TITLE_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 160
} as const

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 1000
} as const

// Currency and Pricing
export const CURRENCY = {
  DEFAULT: 'CAD',
  SYMBOL: '$',
  LOCALE: 'en-CA'
} as const

// Component Configuration
export const COMPONENT_CONFIG = {
  LAZY_LOAD_DELAY: 1000, // milliseconds
  DEBOUNCE_DELAY: 300,   // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
  TOAST_DURATION: 5000   // milliseconds
} as const

// Database Configuration
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  QUERY_TIMEOUT: 5000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  CREATED: 'Successfully created!',
  SENT: 'Successfully sent!'
} as const

// Feature Flags
export const FEATURES = {
  ENABLE_CACHING: process.env.NODE_ENV === 'production',
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production'
} as const
