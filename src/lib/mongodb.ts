import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
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
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB with Mongoose')
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

