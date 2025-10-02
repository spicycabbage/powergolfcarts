const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Product schema (simplified for migration)
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  originalPrice: Number,
  priceUSD: Number,
  priceCAD: Number,
  originalPriceUSD: Number,
  originalPriceCAD: Number,
  variants: [{
    name: String,
    value: String,
    price: Number,
    originalPrice: Number,
    priceUSD: Number,
    priceCAD: Number,
    originalPriceUSD: Number,
    originalPriceCAD: Number,
    inventory: Number,
    sku: String
  }]
}, { timestamps: true })

const Product = mongoose.model('Product', ProductSchema)

// Exchange rate for migration (approximate)
const USD_TO_CAD_RATE = 1.35

async function migrateProducts() {
  try {
    console.log('Starting product migration to dual pricing...')
    
    // Find all products that don't have dual pricing yet
    const products = await Product.find({
      $or: [
        { priceUSD: { $exists: false } },
        { priceCAD: { $exists: false } }
      ]
    })

    console.log(`Found ${products.length} products to migrate`)

    let migratedCount = 0

    for (const product of products) {
      const updates = {}

      // Migrate main product pricing
      if (!product.priceUSD && product.price) {
        updates.priceUSD = product.price
      }
      
      if (!product.priceCAD && product.price) {
        // Convert USD to CAD using approximate rate
        updates.priceCAD = Math.round(product.price * USD_TO_CAD_RATE * 100) / 100
      }

      if (!product.originalPriceUSD && product.originalPrice) {
        updates.originalPriceUSD = product.originalPrice
      }

      if (!product.originalPriceCAD && product.originalPrice) {
        updates.originalPriceCAD = Math.round(product.originalPrice * USD_TO_CAD_RATE * 100) / 100
      }

      // Migrate variant pricing
      if (product.variants && product.variants.length > 0) {
        updates.variants = product.variants.map(variant => {
          const updatedVariant = { ...variant.toObject() }

          if (!updatedVariant.priceUSD && updatedVariant.price) {
            updatedVariant.priceUSD = updatedVariant.price
          }

          if (!updatedVariant.priceCAD && updatedVariant.price) {
            updatedVariant.priceCAD = Math.round(updatedVariant.price * USD_TO_CAD_RATE * 100) / 100
          }

          if (!updatedVariant.originalPriceUSD && updatedVariant.originalPrice) {
            updatedVariant.originalPriceUSD = updatedVariant.originalPrice
          }

          if (!updatedVariant.originalPriceCAD && updatedVariant.originalPrice) {
            updatedVariant.originalPriceCAD = Math.round(updatedVariant.originalPrice * USD_TO_CAD_RATE * 100) / 100
          }

          return updatedVariant
        })
      }

      // Update the product
      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, updates)
        migratedCount++
        console.log(`Migrated product: ${product.name}`)
      }
    }

    console.log(`Migration completed! ${migratedCount} products migrated.`)
    
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run migration
if (require.main === module) {
  connectToDatabase().then(() => {
    migrateProducts()
  })
}

module.exports = { migrateProducts }
