const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env.local')
  process.exit(1)
}

function toSlug(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  try {
    const productsCol = db.collection('products')

    // Find products without variants
    const cursor = productsCol.find({ $or: [ { variants: { $exists: false } }, { variants: { $size: 0 } } ] })

    let examined = 0
    let updated = 0
    const simpleCbdNames = new Set([
      'cbd isolate 1g',
      'cbd tincture 1000mg'
    ])

    while (await cursor.hasNext()) {
      const p = await cursor.next()
      examined++
      const nameLc = (p.name || '').toLowerCase()

      // Skip the two CBD products (expected to remain simple)
      if (simpleCbdNames.has(nameLc)) {
        continue
      }

      const variant = {
        name: 'default',
        value: 'standard',
        price: typeof p.price === 'number' ? p.price : 0,
        inventory: p?.inventory?.quantity ?? 0,
        sku: `SKU-${toSlug(p.slug || p.name || String(p._id))}`,
      }

      const res = await productsCol.updateOne(
        { _id: new ObjectId(p._id) },
        {
          $push: { variants: variant },
          $set: {
            // For variable products, avoid double-counting stock at product level
            'inventory.trackInventory': false,
            price: variant.price || p.price || 0,
          },
        }
      )
      if (res.modifiedCount > 0) updated++
    }

    console.log(`Examined: ${examined}`)
    console.log(`Backfilled variants on: ${updated}`)
  } catch (e) {
    console.error('Backfill error:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  main()
}


