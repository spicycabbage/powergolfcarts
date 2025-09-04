require('dotenv').config()
const mongoose = require('mongoose')

async function deleteTagCategories() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set. Define it in .env.local or your environment.')
      process.exit(1)
    }
    await mongoose.connect(MONGODB_URI)
    
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: String,
      slug: String,
      parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    }))
    
    // Categories to KEEP
    const keepCategories = [
      'Flowers', 'Concentrates', 'Edibles', 'Hash', 'CBD',
      'Indica', 'Sativa', 'Hybrid', 'Shatters', 'Diamonds'
    ]
    
    const allCategories = await Category.find().lean()
    console.log(`Total categories before cleanup: ${allCategories.length}`)
    
    // Find categories to delete
    const toDelete = allCategories.filter(cat => !keepCategories.includes(cat.name))
    const toKeep = allCategories.filter(cat => keepCategories.includes(cat.name))
    
    console.log(`\nCategories to KEEP (${toKeep.length}):`)
    toKeep.forEach(cat => console.log(`  ✅ ${cat.name}`))
    
    console.log(`\nCategories to DELETE (${toDelete.length}):`)
    toDelete.forEach(cat => console.log(`  ❌ ${cat.name}`))
    
    if (process.argv.includes('--confirm')) {
      // Delete the tag categories
      const deleteIds = toDelete.map(cat => cat._id)
      const result = await Category.deleteMany({ _id: { $in: deleteIds } })
      console.log(`\n✅ Deleted ${result.deletedCount} tag categories`)
      
      // Also need to remove these category references from products
      const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
      }))
      
      const updateResult = await Product.updateMany(
        { categories: { $in: deleteIds } },
        { $pullAll: { categories: deleteIds } }
      )
      console.log(`✅ Updated ${updateResult.modifiedCount} products to remove deleted category references`)
      
    } else {
      console.log('\n⚠️  To actually delete these categories, run:')
      console.log('node scripts/delete-tag-categories.js --confirm')
    }
    
    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

deleteTagCategories()
