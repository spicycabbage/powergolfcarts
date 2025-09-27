const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function importReviews() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Read CSV file
    const csvPath = path.join(__dirname, 'reviews-import.csv')
    if (!fs.existsSync(csvPath)) {
      console.log('❌ CSV file not found. Please create: scripts/reviews-import.csv')
      console.log('\nExpected format:')
      console.log('productSlug,customerName,customerEmail,rating,comment,isVerifiedPurchase,createdAt')
      console.log('firecracker-moonrocks-15g,John,john@example.com,5,"Amazing quality!",true,2024-01-15')
      return
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    
    console.log('📊 Starting review import...')
    console.log(`📝 Found ${lines.length - 1} reviews to import`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        const reviewData = {}
        
        headers.forEach((header, index) => {
          reviewData[header.trim()] = values[index]?.trim()
        })
        
        // Find product by slug
        const product = await db.collection('products').findOne({ 
          slug: reviewData.productSlug 
        })
        
        if (!product) {
          console.log(`⚠️  Product not found: ${reviewData.productSlug}`)
          skipped++
          continue
        }
        
        // Prepare review document
        const review = {
          product: product._id,
          customerName: reviewData.customerName,
          customerEmail: reviewData.customerEmail || '',
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment,
          isApproved: true,
          isVerifiedPurchase: reviewData.isVerifiedPurchase === 'true' || reviewData.isVerifiedPurchase === 'TRUE',
          helpfulCount: 0,
          createdAt: reviewData.createdAt ? new Date(reviewData.createdAt) : new Date(),
          updatedAt: new Date()
        }
        
        // Validate required fields
        if (!review.customerName || !review.rating || !review.comment) {
          console.log(`⚠️  Missing required fields for review ${i}`)
          skipped++
          continue
        }
        
        if (review.rating < 1 || review.rating > 5) {
          console.log(`⚠️  Invalid rating (${review.rating}) for review ${i}`)
          skipped++
          continue
        }
        
        // Insert review
        const result = await db.collection('reviews').insertOne(review)
        
        // Update product's review stats
        await updateProductReviewStats(db, product._id)
        
        console.log(`✅ Imported review for ${reviewData.productSlug} (${review.rating}⭐)`)
        imported++
        
      } catch (error) {
        console.log(`❌ Error importing review ${i}:`, error.message)
        errors++
      }
    }
    
    console.log('\n📊 Import Summary:')
    console.log(`✅ Imported: ${imported}`)
    console.log(`⚠️  Skipped: ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await client.close()
  }
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current) // Add the last field
  return result
}

// Update product review statistics
async function updateProductReviewStats(db, productId) {
  const stats = await db.collection('reviews').aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]).toArray()
  
  const { averageRating = 0, reviewCount = 0 } = stats[0] || {}
  
  await db.collection('products').updateOne(
    { _id: productId },
    {
      $set: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount
      }
    }
  )
}

// Run the import
importReviews().catch(console.error)
