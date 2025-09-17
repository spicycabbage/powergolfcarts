#!/usr/bin/env node

const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function checkMissingShortDescriptions() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  
  try {
    const db = client.db()
    const productsCollection = db.collection('products')
    
    console.log('🔍 Checking for products with missing shortDescriptions...\n')
    
    // Find products with missing or empty shortDescription
    const missingShortDesc = await productsCollection.find({
      $or: [
        { shortDescription: { $exists: false } },
        { shortDescription: null },
        { shortDescription: '' },
        { shortDescription: /^\s*$/ } // Only whitespace
      ]
    }).project({
      name: 1,
      slug: 1,
      shortDescription: 1,
      isActive: 1
    }).toArray()
    
    // Find products WITH shortDescription for comparison
    const withShortDesc = await productsCollection.find({
      shortDescription: { $exists: true, $ne: null, $ne: '', $not: /^\s*$/ }
    }).project({
      name: 1,
      slug: 1,
      shortDescription: 1
    }).limit(5).toArray()
    
    console.log(`📊 SUMMARY:`)
    console.log(`❌ Products missing shortDescription: ${missingShortDesc.length}`)
    console.log(`✅ Products with shortDescription: ${await productsCollection.countDocuments({
      shortDescription: { $exists: true, $ne: null, $ne: '', $not: /^\s*$/ }
    })}`)
    console.log(`📦 Total products: ${await productsCollection.countDocuments()}`)
    
    if (missingShortDesc.length > 0) {
      console.log(`\n❌ PRODUCTS MISSING SHORT DESCRIPTION:`)
      missingShortDesc.forEach((product, index) => {
        const status = product.isActive ? '🟢' : '🔴'
        const shortDesc = product.shortDescription === null ? 'null' : 
                         product.shortDescription === '' ? 'empty string' :
                         product.shortDescription === undefined ? 'undefined' : 
                         `"${product.shortDescription}"`
        console.log(`${index + 1}. ${status} ${product.name}`)
        console.log(`   Slug: ${product.slug}`)
        console.log(`   ShortDescription: ${shortDesc}`)
        console.log(`   URL: /products/${product.slug}`)
        console.log('')
      })
    }
    
    if (withShortDesc.length > 0) {
      console.log(`\n✅ SAMPLE PRODUCTS WITH SHORT DESCRIPTION:`)
      withShortDesc.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   ShortDescription: "${product.shortDescription.substring(0, 100)}${product.shortDescription.length > 100 ? '...' : ''}"`)
        console.log(`   URL: /products/${product.slug}`)
        console.log('')
      })
    }
    
  } finally {
    await client.close()
  }
}

// Run the check
checkMissingShortDescriptions()
  .then(() => {
    console.log('🎉 Check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Check failed:', error)
    process.exit(1)
  })
