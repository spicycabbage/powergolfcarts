require('dotenv').config()
const { MongoClient } = require('mongodb')

async function testEmailSubscription() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    return
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log('Testing email subscription system...')
    
    // Test 1: Check if EmailSubscriber collection exists
    const collections = await db.listCollections().toArray()
    const hasEmailSubscribers = collections.some(c => c.name === 'emailsubscribers')
    console.log(`EmailSubscriber collection exists: ${hasEmailSubscribers}`)
    
    // Test 2: Try to create a test subscriber directly in DB
    try {
      const testSubscriber = {
        email: 'test@example.com',
        isActive: true,
        subscribedAt: new Date(),
        source: 'test',
        tags: [],
        preferences: {
          productUpdates: true,
          promotions: true,
          blogPosts: false,
          weeklyDigest: true
        },
        emailsSent: 0,
        clicks: 0,
        opens: 0,
        unsubscribeToken: require('crypto').randomBytes(32).toString('hex')
      }
      
      const result = await db.collection('emailsubscribers').insertOne(testSubscriber)
      console.log('Test subscriber created:', result.insertedId)
      
      // Clean up test subscriber
      await db.collection('emailsubscribers').deleteOne({ _id: result.insertedId })
      console.log('Test subscriber cleaned up')
    } catch (error) {
      console.error('Error creating test subscriber:', error)
    }
    
    // Test 3: Check existing subscribers
    const subscriberCount = await db.collection('emailsubscribers').countDocuments()
    console.log(`Existing subscribers: ${subscriberCount}`)
    
    // Test 4: Check if the model is working
    try {
      const EmailSubscriber = require('../src/lib/models/EmailSubscriber').default
      console.log('EmailSubscriber model loaded successfully')
    } catch (error) {
      console.error('Error loading EmailSubscriber model:', error)
    }
    
  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await client.close()
  }
}

testEmailSubscription()
