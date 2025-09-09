const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' })
require('dotenv').config({ path: '.env.local' })

// MongoDB connection - use the same URI as your app
const MONGODB_URI = process.env.MONGODB_URI

// Product schema (simplified for this script)
const ProductSchema = new mongoose.Schema({
  name: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }]
}, { collection: 'products' })

const Product = mongoose.model('Product', ProductSchema)

// Helper function to create SEO-friendly filename
function createSeoFilename(productName, index = 0) {
  const seoName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
  
  return index > 0 ? `${seoName}-${index + 1}` : seoName
}

// Main function to rename images
async function renameImages() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set')
    }
    
    console.log('🔗 Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')

    const products = await Product.find({ 
      images: { $exists: true, $not: { $size: 0 } } 
    }).select('name images')

    console.log(`📦 Found ${products.length} products with images`)

    let renamedCount = 0
    let errorCount = 0

    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.name}`)
      
      let hasChanges = false
      
      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i]
        const currentUrl = image.url
        
        // Skip if not a generic filename (already has descriptive name)
        if (!currentUrl.includes('/uploads/') || 
            (!currentUrl.includes('prod-') && !currentUrl.includes('cat-') && !currentUrl.includes('post-'))) {
          console.log(`  ⏭️  Skipping non-generic: ${currentUrl}`)
          continue
        }

        // Extract current filename and extension
        const urlParts = currentUrl.split('/')
        const currentFilename = urlParts[urlParts.length - 1]
        const ext = path.extname(currentFilename)
        const directory = urlParts.slice(0, -1).join('/')
        
        // Create new SEO-friendly filename
        const seoBasename = createSeoFilename(product.name, i)
        const newFilename = `${seoBasename}${ext}`
        const newUrl = `${directory}/${newFilename}`
        
        // Build file paths
        const currentPath = path.join(process.cwd(), 'public', currentUrl.substring(1))
        const newPath = path.join(process.cwd(), 'public', newUrl.substring(1))
        
        // Check if current file exists
        if (!fs.existsSync(currentPath)) {
          console.log(`  ❌ File not found: ${currentPath}`)
          errorCount++
          continue
        }
        
        // Check if new filename already exists
        if (fs.existsSync(newPath)) {
          console.log(`  ⚠️  Target exists, adding timestamp: ${newPath}`)
          const timestamp = Date.now()
          const newFilenameWithTimestamp = `${seoBasename}-${timestamp}${ext}`
          const newUrlWithTimestamp = `${directory}/${newFilenameWithTimestamp}`
          const newPathWithTimestamp = path.join(process.cwd(), 'public', newUrlWithTimestamp.substring(1))
          
          // Rename file
          fs.renameSync(currentPath, newPathWithTimestamp)
          
          // Update database
          product.images[i].url = newUrlWithTimestamp
          hasChanges = true
          renamedCount++
          
          console.log(`  ✅ Renamed: ${currentFilename} → ${newFilenameWithTimestamp}`)
        } else {
          // Rename file
          fs.renameSync(currentPath, newPath)
          
          // Update database
          product.images[i].url = newUrl
          hasChanges = true
          renamedCount++
          
          console.log(`  ✅ Renamed: ${currentFilename} → ${newFilename}`)
        }
      }
      
      // Save product if there were changes
      if (hasChanges) {
        await product.save()
        console.log(`  💾 Updated database for: ${product.name}`)
      }
    }

    console.log(`\n🎉 Renaming complete!`)
    console.log(`✅ Successfully renamed: ${renamedCount} images`)
    console.log(`❌ Errors: ${errorCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
if (require.main === module) {
  renameImages()
}

module.exports = { renameImages }
