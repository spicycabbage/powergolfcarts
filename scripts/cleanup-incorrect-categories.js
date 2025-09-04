const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
dotenv.config()
const mongoose = require('mongoose')

// Category schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image: String,
  isActive: { type: Boolean, default: true },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true })

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)

// Product schema to check which categories are actually used
const productSchema = new mongoose.Schema({
  name: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [String]
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

async function cleanupIncorrectCategories() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set. Define it in .env.local or your environment.')
      process.exit(1)
    }
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get all categories
    const allCategories = await Category.find().lean()
    console.log(`Found ${allCategories.length} total categories`)

    // Get all products to see which categories are actually used
    const products = await Product.find().populate('categories').lean()
    console.log(`Found ${products.length} products`)

    // Find categories that are actually referenced by products
    const usedCategoryIds = new Set()
    products.forEach(product => {
      if (product.categories) {
        product.categories.forEach(cat => {
          if (cat && cat._id) {
            usedCategoryIds.add(cat._id.toString())
          }
        })
      }
    })

    console.log(`\nCategories referenced by products: ${usedCategoryIds.size}`)

    // Define the 5 main categories we want to keep
    const mainCategoryNames = ['Flowers', 'Concentrates', 'Hash', 'Edibles', 'CBD']
    
    // Find main categories and their subcategories
    const mainCategories = allCategories.filter(cat => 
      mainCategoryNames.includes(cat.name) && !cat.parent
    )
    
    const validCategoryIds = new Set()
    const categoriesToKeep = []
    
    // Add main categories
    mainCategories.forEach(cat => {
      validCategoryIds.add(cat._id.toString())
      categoriesToKeep.push(cat)
    })
    
    // Add their subcategories (children)
    allCategories.forEach(cat => {
      if (cat.parent && validCategoryIds.has(cat.parent.toString())) {
        validCategoryIds.add(cat._id.toString())
        categoriesToKeep.push(cat)
      }
    })
    
    // Find categories to delete (everything else)
    const categoriesToDelete = allCategories.filter(cat => 
      !validCategoryIds.has(cat._id.toString())
    )

    console.log(`\nCategories to keep: ${categoriesToKeep.length}`)
    categoriesToKeep.forEach(cat => {
      console.log(`  ✅ ${cat.name} (${cat.slug})`)
    })

    console.log(`\nCategories to delete: ${categoriesToDelete.length}`)
    categoriesToDelete.forEach(cat => {
      console.log(`  ❌ ${cat.name} (${cat.slug})`)
    })

    if (categoriesToDelete.length > 0) {
      const confirm = process.argv.includes('--confirm')
      if (!confirm) {
        console.log('\n⚠️  To actually delete these categories, run:')
        console.log('node scripts/cleanup-incorrect-categories.js --confirm')
        return
      }

      // Delete the incorrect categories
      const deleteIds = categoriesToDelete.map(cat => cat._id)
      const result = await Category.deleteMany({ _id: { $in: deleteIds } })
      console.log(`\n✅ Deleted ${result.deletedCount} incorrect categories`)
    }

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanupIncorrectCategories()
