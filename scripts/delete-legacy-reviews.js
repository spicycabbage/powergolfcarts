// Delete legacy (no status) reviews for a given product slug
// Usage: node scripts/delete-legacy-reviews.js <product-slug>

const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
const mongoose = require('mongoose')

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: node scripts/delete-legacy-reviews.js <product-slug>')
    process.exit(1)
  }
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI missing')
    process.exit(1)
  }
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const products = db.collection('products')
  const reviews = db.collection('reviews')
  const product = await products.findOne({ slug })
  if (!product) {
    console.error('Product not found:', slug)
    process.exit(1)
  }
  const res = await reviews.deleteMany({
    product: product._id,
    $or: [ { status: { $exists: false } }, { status: null } ]
  })
  console.log(`Deleted ${res.deletedCount} legacy reviews for`, slug)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})



