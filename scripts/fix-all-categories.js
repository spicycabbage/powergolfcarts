const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

async function fixAllCategories() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    const productsCollection = db.collection('products')
    const categoriesCollection = db.collection('categories')
    
    // Get all categories
    const categories = await categoriesCollection.find({}).toArray()
    const categoryBySlug = {}
    const categoryByName = {}
    categories.forEach(cat => {
      categoryBySlug[cat.slug] = cat
      categoryByName[cat.name.toLowerCase()] = cat
    })
    
    console.log(`📦 Found ${categories.length} categories`)
    console.log('Available categories:', categories.map(c => `${c.name} (${c.slug})`).join(', '))
    
    // Get all products
    const products = await productsCollection.find({}).toArray()
    console.log(`📦 Found ${products.length} products`)
    
    let fixed = 0
    
    for (const product of products) {
      let needsUpdate = false
      const updates = {}
      
      // Fix primary category - convert string references to ObjectId
      if (product.category) {
        if (typeof product.category === 'string') {
          // Try to find category by ObjectId string
          const categoryId = categoryBySlug[product.category] || categories.find(c => c._id.toString() === product.category)
          if (categoryId) {
            updates.category = new ObjectId(categoryId._id)
            needsUpdate = true
          }
        } else if (product.category && !product.category._id && product.category.slug) {
          // Category object without proper _id
          const matchedCategory = categoryBySlug[product.category.slug]
          if (matchedCategory) {
            updates.category = new ObjectId(matchedCategory._id)
            needsUpdate = true
          }
        }
      }
      
      // Fix additional categories
      if (Array.isArray(product.categories) && product.categories.length > 0) {
        const fixedCategories = []
        let categoriesChanged = false
        
        for (const cat of product.categories) {
          if (typeof cat === 'string') {
            const matchedCategory = categoryBySlug[cat] || categories.find(c => c._id.toString() === cat)
            if (matchedCategory) {
              fixedCategories.push(new ObjectId(matchedCategory._id))
              categoriesChanged = true
            }
          } else if (cat && cat.slug) {
            const matchedCategory = categoryBySlug[cat.slug]
            if (matchedCategory) {
              fixedCategories.push(new ObjectId(matchedCategory._id))
              categoriesChanged = true
            }
          } else if (cat && cat._id) {
            fixedCategories.push(new ObjectId(cat._id))
          }
        }
        
        if (categoriesChanged) {
          updates.categories = fixedCategories
          needsUpdate = true
        }
      }
      
      // If no primary category, try to assign one based on product name
      if (!updates.category && !product.category) {
        const productName = product.name.toLowerCase()
        let assignedCategory = null
        
        if (productName.includes('hash')) {
          assignedCategory = categoryBySlug['hash']
        } else if (productName.includes('shatter') || productName.includes('diamond') || productName.includes('rosin')) {
          assignedCategory = categoryBySlug['concentrates']
        } else if (productName.includes('edible') || productName.includes('gummies') || productName.includes('bomb')) {
          assignedCategory = categoryBySlug['edibles']
        } else if (productName.includes('cbd')) {
          assignedCategory = categoryBySlug['cbd']
        } else {
          // Check if it's a flower strain - most products without specific indicators are flowers
          assignedCategory = categoryBySlug['flowers']
        }
        
        if (assignedCategory) {
          updates.category = new ObjectId(assignedCategory._id)
          needsUpdate = true
          console.log(`🔧 Assigning primary category for ${product.name}: ${assignedCategory.name}`)
        }
      }
      
      if (needsUpdate) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        )
        fixed++
        console.log(`✅ Fixed categories for: ${product.name}`)
      }
    }
    
    console.log(`✅ Fixed categories for ${fixed} products`)
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

fixAllCategories()
