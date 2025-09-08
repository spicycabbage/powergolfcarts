// Find active products that do not have a usable image URL
// Usage: node scripts/find-missing-images.js

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

if (!MONGODB_URI) {
  console.error('MONGODB_URI missing in .env.local')
  process.exit(1)
}

function hasUsableImage(product) {
  const imgs = Array.isArray(product.images) ? product.images : []
  for (const img of imgs) {
    if (typeof img === 'string') {
      if (img && String(img).trim() !== '') return true
    } else if (img && typeof img === 'object') {
      const url = String(img.url || '')
      if (url.trim() !== '') return true
    }
  }
  return false
}

;(async () => {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)
  try {
    const cursor = db.collection('products').find({}, { projection: { name: 1, slug: 1, images: 1, isActive: 1 } })
    const missingActive = []
    const missingAll = []
    while (await cursor.hasNext()) {
      const p = await cursor.next()
      if (!hasUsableImage(p)) {
        missingAll.push({ name: p.name, slug: p.slug, isActive: !!p.isActive })
        if (p.isActive) missingActive.push({ name: p.name, slug: p.slug })
      }
    }
    console.log('Active products without images:', missingActive.length)
    if (missingActive.length) {
      missingActive.slice(0, 100).forEach((p) => console.log(` - ${p.name} (${p.slug})`))
      if (missingActive.length > 100) console.log(` ... and ${missingActive.length - 100} more`)
    }
    console.log('\nAll products without images:', missingAll.length)
  } catch (e) {
    console.error('Query failed:', e.message)
    process.exit(1)
  } finally {
    await client.close()
  }
})()


