require('dotenv').config()
const { MongoClient } = require('mongodb')

async function findTempleBallDuplicates() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    return
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log('Searching for temple-ball products...')
    
    // Find all products with temple-ball in the slug
    const products = await db.collection('products').find({
      slug: { $regex: /temple-ball/i }
    }).toArray()
    
    console.log(`Found ${products.length} temple-ball products:`)
    products.forEach(p => {
      console.log(`- ID: ${p._id}`)
      console.log(`  Name: ${p.name}`)
      console.log(`  Slug: ${p.slug}`)
      console.log(`  Active: ${p.isActive}`)
      console.log(`  Created: ${p.createdAt}`)
      console.log('---')
    })
    
    // Check for the specific slugs
    const capitalH = await db.collection('products').findOne({ slug: 'temple-ball-Hash' })
    const lowercaseH = await db.collection('products').findOne({ slug: 'temple-ball-hash' })
    
    console.log('\nSpecific slug check:')
    console.log('temple-ball-Hash:', capitalH ? 'EXISTS' : 'NOT FOUND')
    console.log('temple-ball-hash:', lowercaseH ? 'EXISTS' : 'NOT FOUND')
    
    if (capitalH && lowercaseH) {
      console.log('\nBoth versions exist - this confirms the duplicate issue!')
      console.log('Capital H version ID:', capitalH._id)
      console.log('Lowercase version ID:', lowercaseH._id)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

findTempleBallDuplicates()
