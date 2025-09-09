const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const xml2js = require('xml2js')

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

// Add the same index as the actual Review model
ReviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true, $ne: null } } })

let Product, Review

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  Product = mongoose.model('Product', ProductSchema)
  Review = mongoose.model('Review', ReviewSchema)
  console.log('✅ Connected to MongoDB')
}

async function parseWordPressXML(filePath) {
  const xmlContent = fs.readFileSync(filePath, 'utf8')
  const parser = new xml2js.Parser({ 
    explicitArray: false,
    mergeAttrs: true 
  })
  
  return await parser.parseStringPromise(xmlContent)
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
  
  console.log(`📝 Found ${products.length} products and ${reviews.length} reviews`)
  return { products, reviews }
}

async function showUnmatchedProducts(wpProducts) {
  console.log('\n🔍 Checking for unmatched WordPress products...')
  
  const allCurrentProducts = await Product.find({}, { name: 1, slug: 1 })
  const unmatched = []
  
  for (const wpProduct of wpProducts) {
    if (wpProduct.status !== 'publish') continue
    
    let product = null
    
    // Try all matching strategies
    product = allCurrentProducts.find(p => p.slug === wpProduct.slug)
    
    if (!product) {
      const wpSlug = wpProduct.slug.replace(/s$/, '').replace(/-$/, '')
      product = allCurrentProducts.find(p => {
        const currentSlug = p.slug.replace(/s$/, '').replace(/-$/, '')
        return currentSlug === wpSlug
      })
    }
    
    if (!product) {
      product = allCurrentProducts.find(p => 
        p.name.toLowerCase() === wpProduct.title.toLowerCase()
      )
    }
    
    if (!product) {
      const wpName = wpProduct.title.toLowerCase().replace(/s$/, '').trim()
      product = allCurrentProducts.find(p => {
        const currentName = p.name.toLowerCase().replace(/s$/, '').trim()
        return currentName === wpName
      })
    }
    
    if (!product) {
      const cleanWpName = wpProduct.title.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
      product = allCurrentProducts.find(p => {
        const cleanCurrentName = p.name.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
        return cleanCurrentName.includes(cleanWpName) || cleanWpName.includes(cleanCurrentName)
      })
    }
    
    if (!product) {
      unmatched.push(wpProduct)
    }
  }
  
  if (unmatched.length > 0) {
    console.log(`\n⚠️  Found ${unmatched.length} unmatched WordPress products:`)
    unmatched.forEach((wp, index) => {
      console.log(`${index + 1}. "${wp.title}" (slug: ${wp.slug}, wpId: ${wp.wpId})`)
    })
    
    console.log(`\n📋 Current products in your database:`)
    allCurrentProducts.forEach((p, index) => {
      console.log(`${index + 1}. "${p.name}" (slug: ${p.slug})`)
    })
  } else {
    console.log('✅ All WordPress products were matched!')
  }
  
  return unmatched
}

async function importReviewsForProduct(wpProductTitle, currentProductName, wpProducts, wpReviews) {
  console.log(`\n🎯 Importing reviews for: "${wpProductTitle}" → "${currentProductName}"`)
  
  // Find the WordPress product
  const wpProduct = wpProducts.find(p => p.title === wpProductTitle)
  if (!wpProduct) {
    console.error(`❌ WordPress product "${wpProductTitle}" not found`)
    return
  }
  
  // Find the current product
  const currentProduct = await Product.findOne({ name: currentProductName })
  if (!currentProduct) {
    console.error(`❌ Current product "${currentProductName}" not found`)
    return
  }
  
  console.log(`✅ Found WordPress product: ${wpProduct.title} (wpId: ${wpProduct.wpId})`)
  console.log(`✅ Found current product: ${currentProduct.name} (id: ${currentProduct._id})`)
  
  // Find reviews for this WordPress product
  const productReviews = wpReviews.filter(r => r.wpPostId === wpProduct.wpId)
  console.log(`📝 Found ${productReviews.length} reviews to import`)
  
  let imported = 0
  let skipped = 0
  
  for (const wpReview of productReviews) {
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
        product: currentProduct._id
      })
      
      await review.save()
      imported++
      console.log(`✅ Imported review from ${wpReview.customerName} (${wpReview.rating} stars)`)
      
    } catch (error) {
      console.error(`❌ Failed to import review:`, error.message)
      skipped++
    }
  }
  
  console.log(`\n🎉 Import completed for "${currentProductName}"!`)
  console.log(`✅ Imported: ${imported} reviews`)
  console.log(`⏭️  Skipped: ${skipped} reviews`)
  
  // Update product ratings
  if (imported > 0) {
    await updateProductRating(currentProduct._id)
  }
  
  return { imported, skipped }
}

async function updateProductRating(productId) {
  console.log('📊 Updating product rating...')
  
  const reviews = await Review.find({ product: productId, isApproved: true })
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0
    })
    return
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length
  
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    reviewCount: reviews.length
  })
  
  console.log(`✅ Updated rating: ${averageRating.toFixed(1)} (${reviews.length} reviews)`)
}

async function main() {
  const xmlFile = process.argv[2]
  const wpProductTitle = process.argv[3]
  const currentProductName = process.argv[4]
  
  if (!xmlFile) {
    console.error('❌ Please provide the WordPress XML file path')
    console.log('Usage:')
    console.log('  1. Show unmatched products: node scripts/import-single-product-reviews.js path/to/wordpress-export.xml')
    console.log('  2. Import specific product: node scripts/import-single-product-reviews.js path/to/wordpress-export.xml "WP Product Name" "Current Product Name"')
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
    
    if (!wpProductTitle || !currentProductName) {
      // Show unmatched products
      await showUnmatchedProducts(products)
    } else {
      // Import reviews for specific product
      await importReviewsForProduct(wpProductTitle, currentProductName, products, reviews)
    }
    
    console.log('\n🎉 All done!')
    
  } catch (error) {
    console.error('❌ Operation failed:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

main()
