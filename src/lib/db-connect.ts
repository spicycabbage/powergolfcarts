import { connectToDatabase } from './mongodb'

// This ensures the database connection is established
// Call this in your app's entry point or API routes
export async function ensureDatabaseConnection() {
  try {
    await connectToDatabase()
    console.log('✅ Database connection established')
  } catch (error) {
    console.error('❌ Failed to establish database connection:', error)
    throw error
  }
}






