import mongoose from 'mongoose'

// Allow builds/runs without a Mongo URI when using Atlas Data API
if (process.env.USE_DATA_API !== '1' && !process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

// Global variable to cache the connection
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Ensure a database name exists in the URI; if missing, append MONGODB_DB
    let effectiveUri = MONGODB_URI as string
    const uriMatch = effectiveUri.match(/^mongodb(?:\+srv)?:\/\/[^/]+(\/[^?]+)?(\?.*)?$/)
    if (uriMatch) {
      const hasDbPath = !!(uriMatch[1] && uriMatch[1] !== '/')
      if (!hasDbPath) {
        const query = uriMatch[2] || ''
        const hostPart = effectiveUri.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+).*/, '$1')
        effectiveUri = `${hostPart}/${MONGODB_DB}${query}`
      }
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
      family: 4
    } as any

    cached.promise = mongoose.connect(effectiveUri, opts).then((mongoose) => {
      // Avoid logging full URI; log only database name when possible
      try {
        const connectedDb = (mongoose.connection as any)?.db
        const dbName: string | undefined = connectedDb?.databaseName
        // Connection established
      } catch {
        // Connection established
      }
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

// New function for build-time safe database access
export async function connectToDatabaseSafe() {
  // Check if we're in build mode or if MongoDB URI is not available
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.warn('MongoDB URI not available during build, skipping database connection')
    return null
  }

  // Check if we're in a build environment where database might not be accessible
  if (process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('Build environment detected, using safe database connection')
  }

  try {
    return await connectToDatabase()
  } catch (error) {
    // During build time or when database is unavailable, return null
    // This allows pages to render with fallback content
    console.warn('Database connection failed during build/safe access:', error)
    return null
  }
}

// Helper function to disconnect (useful for testing)
export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
  }
}

// Legacy compatibility functions
export async function getDatabase() {
  await connectToDatabase()
  return mongoose.connection.db
}

