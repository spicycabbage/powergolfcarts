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

// Category schema
const CategorySchema = new mongoose.Schema({
  name: String,
  image: String
}, { collection: 'categories' })

const Category = mongoose.model('Category', CategorySchema)

// Post schema
const PostSchema = new mongoose.Schema({
  title: String,
  coverImage: String
}, { collection: 'posts' })

const Post = mongoose.model('Post', PostSchema)

// Function to get all referenced image URLs from database
async function getReferencedImages() {
  const referencedUrls = new Set()
  
  // Get product images
  const products = await Product.find({}).select('images')
  products.forEach(product => {
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img.url) {
          referencedUrls.add(img.url)
        }
      })
    }
  })
  
  // Get category images
  const categories = await Category.find({}).select('image')
  categories.forEach(category => {
    if (category.image) {
      referencedUrls.add(category.image)
    }
  })
  
  // Get post cover images
  const posts = await Post.find({}).select('coverImage')
  posts.forEach(post => {
    if (post.coverImage) {
      referencedUrls.add(post.coverImage)
    }
  })
  
  return referencedUrls
}

// Function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })
  
  return arrayOfFiles
}

// Function to convert file path to URL format
function filePathToUrl(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath)
  return '/' + relativePath.replace(/\\/g, '/')
}

// Main cleanup function
async function cleanupOldImages() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set')
    }
    
    console.log('🔗 Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')

    console.log('📋 Getting all referenced images from database...')
    const referencedUrls = await getReferencedImages()
    console.log(`📊 Found ${referencedUrls.size} referenced images in database`)

    // Check uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const optimizedDir = path.join(process.cwd(), 'public', 'optimized')
    
    let deletedCount = 0
    let skippedCount = 0
    let totalSize = 0

    // Clean up uploads directory
    console.log('\n🧹 Cleaning uploads directory...')
    if (fs.existsSync(uploadsDir)) {
      const uploadFiles = getAllFiles(uploadsDir)
      
      for (const filePath of uploadFiles) {
        const url = filePathToUrl(filePath, path.join(process.cwd(), 'public'))
        
        if (!referencedUrls.has(url)) {
          const stats = fs.statSync(filePath)
          totalSize += stats.size
          
          console.log(`🗑️  Deleting unused: ${url}`)
          fs.unlinkSync(filePath)
          deletedCount++
        } else {
          skippedCount++
        }
      }
    }

    // Clean up optimized directory
    console.log('\n🧹 Cleaning optimized directory...')
    if (fs.existsSync(optimizedDir)) {
      const optimizedFiles = getAllFiles(optimizedDir)
      
      for (const filePath of optimizedFiles) {
        // For optimized files, we need to check if the corresponding original exists
        const relativePath = path.relative(optimizedDir, filePath)
        const filename = path.basename(filePath)
        
        // Extract base filename without size suffixes (_large, _medium, etc.)
        const baseFilename = filename.replace(/_(large|medium|small|thumbnail|xlarge)(\.(webp|jpg|jpeg|png))$/, '$2')
        const directory = path.dirname(relativePath)
        
        // Construct the original URL path
        const originalUrl = directory === '.' 
          ? `/uploads/${baseFilename}`
          : `/uploads/${directory}/${baseFilename}`
        
        // Check if the original image is still referenced
        if (!referencedUrls.has(originalUrl)) {
          const stats = fs.statSync(filePath)
          totalSize += stats.size
          
          console.log(`🗑️  Deleting orphaned optimized: ${relativePath}`)
          fs.unlinkSync(filePath)
          deletedCount++
        } else {
          skippedCount++
        }
      }
    }

    // Clean up empty directories
    console.log('\n📁 Cleaning empty directories...')
    function removeEmptyDirs(dirPath) {
      if (!fs.existsSync(dirPath)) return
      
      const files = fs.readdirSync(dirPath)
      if (files.length === 0) {
        console.log(`📁 Removing empty directory: ${dirPath}`)
        fs.rmdirSync(dirPath)
        return
      }
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file)
        if (fs.statSync(fullPath).isDirectory()) {
          removeEmptyDirs(fullPath)
        }
      })
      
      // Check again if directory is now empty
      const remainingFiles = fs.readdirSync(dirPath)
      if (remainingFiles.length === 0) {
        console.log(`📁 Removing empty directory: ${dirPath}`)
        fs.rmdirSync(dirPath)
      }
    }
    
    removeEmptyDirs(uploadsDir)
    removeEmptyDirs(optimizedDir)

    console.log(`\n🎉 Cleanup complete!`)
    console.log(`🗑️  Files deleted: ${deletedCount}`)
    console.log(`✅ Files kept: ${skippedCount}`)
    console.log(`💾 Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
if (require.main === module) {
  cleanupOldImages()
}

module.exports = { cleanupOldImages }
