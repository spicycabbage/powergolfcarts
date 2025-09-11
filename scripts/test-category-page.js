require('dotenv').config()
const { MongoClient } = require('mongodb')

async function testCategoryPage() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    return
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log('Testing category page data...')
    
    // Test 1: Check if categories exist
    const categories = await db.collection('categories').find({}).limit(5).toArray()
    console.log(`Found ${categories.length} categories:`)
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`)
    })
    
    // Test 2: Check if we can find a specific category
    const testCategory = await db.collection('categories').findOne({ slug: 'flowers' })
    if (testCategory) {
      console.log(`\nTest category found: ${testCategory.name}`)
      
      // Test 3: Check products for this category
      const products = await db.collection('products').find({
        isActive: true,
        $or: [
          { category: testCategory._id },
          { categories: testCategory._id }
        ]
      }).limit(5).toArray()
      
      console.log(`Found ${products.length} products in ${testCategory.name}:`)
      products.forEach(p => {
        console.log(`- ${p.name} ($${p.price})`)
      })
    } else {
      console.log('\nNo test category found')
    }
    
    // Test 4: Check for any database issues
    const dbStats = await db.stats()
    console.log(`\nDatabase stats:`)
    console.log(`- Collections: ${dbStats.collections}`)
    console.log(`- Data size: ${Math.round(dbStats.dataSize / 1024 / 1024)}MB`)
    
  } catch (error) {
    console.error('Error testing category page:', error)
  } finally {
    await client.close()
  }
}

testCategoryPage()
