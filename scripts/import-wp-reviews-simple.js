#!/usr/bin/env node
/**
 * Import WordPress Reviews from XML Export (Node.js Compatible)
 */

const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const mongoose = require('mongoose')

// Load environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Define schemas directly in the script to avoid import issues
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { collection: 'products' })

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: true },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  wpCommentId: { type: Number, unique: true, sparse: true },
  wpPostId: { type: Number },
  wpParentId: { type: Number }
}, { 
  timestamps: true,
  collection: 'reviews'
})

// Add the same index as the actual Review model to allow multiple anonymous reviews per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true, $ne: null } } })

let Product, Review

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
    Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

async function parseWordPressXML(filePath) {
  console.log(`📖 Reading WordPress XML: ${filePath}`)
  
  const xmlData = fs.readFileSync(filePath, 'utf-8')
  const parser = new xml2js.Parser({ 
    explicitArray: false,
    mergeAttrs: true,
    trim: true
  })
  
  const result = await parser.parseStringPromise(xmlData)
  return result
}

function extractReviews(wpData) {
  console.log('🔍 Extracting reviews from WordPress data...')
  
  const items = wpData.rss?.channel?.item || []
  const itemsArray = Array.isArray(items) ? items : [items]
  
  const reviews = []
  const products = []
  
  itemsArray.forEach(item => {
    // Extract products
    if (item['wp:post_type'] === 'product') {
      products.push({
        wpId: parseInt(item['wp:post_id']),
        title: item.title,
        slug: item['wp:post_name'],
        status: item['wp:status']
      })
    }
    
    // Extract comments (reviews)
    const comments = item['wp:comment']
    if (comments) {
      const commentsArray = Array.isArray(comments) ? comments : [comments]
      
      commentsArray.forEach(comment => {
        // Skip non-approved comments and replies
        if (comment['wp:comment_approved'] !== '1' || comment['wp:comment_parent'] !== '0') {
          return
        }
        
        // Extract rating from comment meta
        let rating = 5 // default
        const commentMeta = comment['wp:commentmeta']
        if (commentMeta) {
          const metaArray = Array.isArray(commentMeta) ? commentMeta : [commentMeta]
          const ratingMeta = metaArray.find(meta => meta['wp:meta_key'] === 'rating')
          if (ratingMeta && ratingMeta['wp:meta_value']) {
            rating = parseInt(ratingMeta['wp:meta_value']) || 5
          }
        }
        
        reviews.push({
          wpCommentId: parseInt(comment['wp:comment_id']),
          wpPostId: parseInt(item['wp:post_id']),
          customerName: comment['wp:comment_author'] || 'Anonymous',
          customerEmail: comment['wp:comment_author_email'] || '',
          rating: Math.max(1, Math.min(5, rating)),
          comment: comment['wp:comment_content'] || '',
          createdAt: new Date(comment['wp:comment_date']),
          isApproved: comment['wp:comment_approved'] === '1'
        })
      })
    }
  })
  
  console.log(`📦 Found ${products.length} products and ${reviews.length} reviews`)
  return { products, reviews }
}

async function matchProductsAndImport(wpProducts, wpReviews) {
  console.log('🔗 Matching WordPress products to current products...')
  
  const productMap = new Map()
  const allCurrentProducts = await Product.find({}, { name: 1, slug: 1 })
  
  // Try multiple matching strategies
  for (const wpProduct of wpProducts) {
    if (wpProduct.status !== 'publish') continue
    
    let product = null
    
    // Strategy 1: Exact slug match
    product = allCurrentProducts.find(p => p.slug === wpProduct.slug)
    
    if (!product) {
      // Strategy 2: Similar slug (handle plural/singular differences)
      const wpSlug = wpProduct.slug.replace(/s$/, '').replace(/-$/, '')
      product = allCurrentProducts.find(p => {
        const currentSlug = p.slug.replace(/s$/, '').replace(/-$/, '')
        return currentSlug === wpSlug
      })
    }
    
    if (!product) {
      // Strategy 3: Exact name match (case insensitive)
      product = allCurrentProducts.find(p => 
        p.name.toLowerCase() === wpProduct.title.toLowerCase()
      )
    }
    
    if (!product) {
      // Strategy 4: Similar name match (handle plural/singular)
      const wpName = wpProduct.title.toLowerCase().replace(/s$/, '').trim()
      product = allCurrentProducts.find(p => {
        const currentName = p.name.toLowerCase().replace(/s$/, '').trim()
        return currentName === wpName
      })
    }
    
    if (!product) {
      // Strategy 5: Partial name matching (contains)
      const cleanWpName = wpProduct.title.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
      product = allCurrentProducts.find(p => {
        const cleanCurrentName = p.name.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
        return cleanCurrentName.includes(cleanWpName) || cleanWpName.includes(cleanCurrentName)
      })
    }
    
    if (product) {
      productMap.set(wpProduct.wpId, product._id)
      console.log(`✅ Matched: "${wpProduct.title}" → "${product.name}"`)
    } else {
      console.log(`⚠️  No match found for: "${wpProduct.title}"`)
    }
  }
  
  console.log(`🎯 Successfully matched ${productMap.size} products`)
  
  // Import reviews
  let imported = 0
  let skipped = 0
  
  for (const wpReview of wpReviews) {
    const productId = productMap.get(wpReview.wpPostId)
    
    if (!productId) {
      skipped++
      continue
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ wpCommentId: wpReview.wpCommentId })
    if (existingReview) {
      console.log(`⏭️  Review already exists (WP Comment ID: ${wpReview.wpCommentId})`)
      skipped++
      continue
    }
    
    try {
      const review = new Review({
        ...wpReview,
        product: productId
      })
      
      await review.save()
      imported++
      
      if (imported % 10 === 0) {
        console.log(`📝 Imported ${imported} reviews...`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to import review:`, error.message)
      skipped++
    }
  }
  
  console.log(`\n🎉 Import completed!`)
  console.log(`✅ Imported: ${imported} reviews`)
  console.log(`⏭️  Skipped: ${skipped} reviews`)
  
  return { imported, skipped }
}

async function updateProductRatings() {
  console.log('\n📊 Updating product average ratings...')
  
  const products = await Product.find({})
  let updated = 0
  
  for (const product of products) {
    const reviews = await Review.find({ product: product._id, isApproved: true })
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length
      
      await Product.findByIdAndUpdate(product._id, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length
      })
      
      updated++
    }
  }
  
  console.log(`✅ Updated ratings for ${updated} products`)
}

async function main() {
  const xmlFile = process.argv[2]
  
  if (!xmlFile) {
    console.error('❌ Please provide the WordPress XML file path')
    console.log('Usage: node scripts/import-wp-reviews-simple.js path/to/wordpress-export.xml')
    process.exit(1)
  }
  
  if (!fs.existsSync(xmlFile)) {
    console.error(`❌ File not found: ${xmlFile}`)
    process.exit(1)
  }
  
  try {
    await connectDB()
    
    const wpData = await parseWordPressXML(xmlFile)
    const { products, reviews } = extractReviews(wpData)
    
    if (reviews.length === 0) {
      console.log('⚠️  No reviews found in WordPress export')
      return
    }
    
    const { imported } = await matchProductsAndImport(products, reviews)
    
    if (imported > 0) {
      await updateProductRatings()
    }
    
    console.log('\n🎉 All done!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

main()
