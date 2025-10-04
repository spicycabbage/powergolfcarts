const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

/**
 * Fix character encoding for a specific review
 * 
 * This script will help you manually fix reviews with encoding issues.
 * Replace the reviewId and correctedComment with your values.
 */
async function fixReviewEncoding() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Replace with the actual review ID from Michael's review
    // You can find this in your database or by querying for his name
    const reviewId = 'REPLACE_WITH_ACTUAL_REVIEW_ID' // e.g., '67123abc456def789012'
    
    // The corrected German text (copy from source if you have it)
    const correctedComment = `Wir von gm trolleys haben nun beim ersten schönen Wetter eine 18 Loch Golfrunde mit dem Robera Pro durchgeführt und sind begeistert. Wir hatten in den letzten Jahren einige andere Follow Me Trolleys im Test, auch mit KI! Und nun waren alle Probleme die vorher immer wieder aufgetreten sind nicht mehr vorhanden. Durch die beiden Knöpfe für Follow me und unarch war es einfach den Trolley zu starten! Die Handgeste wurde immer sofort erkannt, was vorher mind. 5 Versuche bei anderen KI Trolleys benötigte. Und der Trolley hielt an man kann den Schlöger entnehmen und nach dem schlag wieder zurückstecken und weiter gehts. Andere KI Trolleys bleiben nicht stehen sondern zucken und wollen weiter folgen usw.....Dazu ist die Gewichtsverteilung beim Robera Pro optimal. Er bleibt nicht hängen bzw. stehen nur weil auf das Slotzrad gekommen ist! Also alles in allem TOP 5 Sterne.......Demnächst mehr bzw. wer mehr wissen möchte einfach an gm-trolleys.de mailen!`
    
    console.log('🔧 Starting encoding fix...')
    
    // Update the review
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { 
        $set: { 
          comment: correctedComment,
          updatedAt: new Date()
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      console.log('❌ Review not found. Please check the reviewId.')
      return
    }
    
    if (result.modifiedCount > 0) {
      console.log('✅ Review encoding fixed successfully!')
    } else {
      console.log('ℹ️  No changes made (comment might already be correct)')
    }
    
  } catch (error) {
    console.error('❌ Failed to fix encoding:', error)
  } finally {
    await client.close()
  }
}

// Alternative: Fix ALL reviews with encoding issues
async function fixAllReviewsWithEncodingIssues() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log('🔍 Searching for reviews with encoding issues...')
    
    // Find reviews containing the replacement character �
    const problematicReviews = await db.collection('reviews')
      .find({ comment: { $regex: '�' } })
      .toArray()
    
    console.log(`📊 Found ${problematicReviews.length} reviews with encoding issues`)
    
    problematicReviews.forEach((review, idx) => {
      console.log(`\n${idx + 1}. ${review.customerName} (${review.rating}★)`)
      console.log(`   ID: ${review._id}`)
      console.log(`   Preview: ${review.comment.substring(0, 100)}...`)
    })
    
    console.log('\n💡 To fix a specific review:')
    console.log('1. Copy the review ID above')
    console.log('2. Get the original text with correct encoding')
    console.log('3. Run: node scripts/fix-review-encoding.js')
    
  } catch (error) {
    console.error('❌ Failed to search reviews:', error)
  } finally {
    await client.close()
  }
}

// Run the appropriate function
const args = process.argv.slice(2)
if (args[0] === '--find') {
  fixAllReviewsWithEncodingIssues().catch(console.error)
} else if (args[0] === '--fix') {
  fixReviewEncoding().catch(console.error)
} else {
  console.log('Usage:')
  console.log('  node scripts/fix-review-encoding.js --find    # Find all reviews with encoding issues')
  console.log('  node scripts/fix-review-encoding.js --fix     # Fix a specific review (edit script first)')
}

