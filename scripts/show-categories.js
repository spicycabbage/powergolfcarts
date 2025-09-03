const mongoose = require('mongoose')

async function showCategories() {
  try {
    const MONGODB_URI = 'mongodb+srv://MatrixNeo88:iSPaMBmXQMyAoUAh@cluster0.fujdly4.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0'
    await mongoose.connect(MONGODB_URI)
    
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: String,
      slug: String,
      parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    }))
    
    const categories = await Category.find().populate('parent').lean()
    console.log(`Total categories: ${categories.length}\n`)
    
    // Group by parent
    const topLevel = categories.filter(cat => !cat.parent)
    const withParent = categories.filter(cat => cat.parent)
    
    console.log('TOP-LEVEL CATEGORIES:')
    topLevel.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`)
      
      // Show children
      const children = withParent.filter(child => 
        child.parent && child.parent._id.toString() === cat._id.toString()
      )
      children.forEach(child => {
        console.log(`  └─ ${child.name} (${child.slug})`)
      })
    })
    
    console.log('\nORPHAN CATEGORIES (should be deleted):')
    const orphans = withParent.filter(cat => {
      if (!cat.parent) return false
      const parentExists = topLevel.some(p => p._id.toString() === cat.parent._id.toString())
      return !parentExists
    })
    orphans.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - parent: ${cat.parent ? cat.parent.name : 'unknown'}`)
    })
    
    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

showCategories()
