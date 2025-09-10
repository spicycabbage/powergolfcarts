const { connectToDatabase } = require('../src/lib/mongodb')
const Product = require('../src/lib/models/Product').default

async function findProducts() {
  try {
    await connectToDatabase()
    
    console.log('🔍 Searching for products mentioned in learn hub...\n')
    
    // Search for blue dream related products
    const blueDreamProducts = await Product.find({
      $or: [
        { name: { $regex: /blue.*dream/i } },
        { slug: { $regex: /blue.*dream/i } }
      ],
      isActive: true
    }).select('name slug').lean()
    
    console.log('Blue Dream products:')
    blueDreamProducts.forEach(p => {
      console.log(`  - ${p.name} → /products/${p.slug}`)
    })
    
    // Search for wedding cake related products
    const weddingCakeProducts = await Product.find({
      $or: [
        { name: { $regex: /wedding.*cake/i } },
        { slug: { $regex: /wedding.*cake/i } }
      ],
      isActive: true
    }).select('name slug').lean()
    
    console.log('\nWedding Cake products:')
    weddingCakeProducts.forEach(p => {
      console.log(`  - ${p.name} → /products/${p.slug}`)
    })
    
    // Search for shatter products
    const shatterProducts = await Product.find({
      $or: [
        { name: { $regex: /shatter/i } },
        { slug: { $regex: /shatter/i } }
      ],
      isActive: true
    }).select('name slug').lean()
    
    console.log('\nShatter products:')
    shatterProducts.forEach(p => {
      console.log(`  - ${p.name} → /products/${p.slug}`)
    })
    
    // Search for diamond products
    const diamondProducts = await Product.find({
      $or: [
        { name: { $regex: /diamond/i } },
        { slug: { $regex: /diamond/i } }
      ],
      isActive: true
    }).select('name slug').lean()
    
    console.log('\nDiamond products:')
    diamondProducts.forEach(p => {
      console.log(`  - ${p.name} → /products/${p.slug}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

findProducts()
