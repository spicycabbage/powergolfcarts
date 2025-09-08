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
      maxPoolSize: 30,
      minPoolSize: 5,
      maxIdleTimeMS: 3600000,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
      family: 4
    } as any

    cached.promise = mongoose.connect(effectiveUri, opts).then((mongoose) => {
      // Avoid logging full URI; log only database name when possible
      try {
        const connectedDb = (mongoose.connection as any)?.db
        const dbName: string | undefined = connectedDb?.databaseName
        if (dbName) {
          console.log(`Connected to MongoDB database: ${dbName}`)
        } else {
          console.log('Connected to MongoDB with Mongoose')
        }
      } catch {
        console.log('Connected to MongoDB with Mongoose')
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

// Helper function to disconnect (useful for testing)
export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('Disconnected from MongoDB')
  }
}

// Legacy compatibility functions
export async function getDatabase() {
  await connectToDatabase()
  return mongoose.connection.db
}

