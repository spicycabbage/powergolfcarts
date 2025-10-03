/*
  Normalize product category references:
  - Ensure product.category is a MongoDB ObjectId
  - Ensure product.categories[] are ObjectIds (no strings/embedded objects)
  - Ensure Robera Pro appears under both Robera and Electric Carts
*/

require('dotenv').config({ path: '.env.local' })
const { MongoClient, ObjectId } = require('mongodb')

async function run() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB || 'insanitygolfdb'
  if (!uri) {
    console.error('MONGODB_URI missing in .env.local')
    process.exit(1)
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  const cats = await db
    .collection('categories')
    .find({}, { projection: { _id: 1, slug: 1 } })
    .toArray()
  const idBySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]))
  const roberaId = idBySlug['robera']
  const cartsId = idBySlug['electric-carts']

  let scanned = 0
  let normalized = 0
  const touchedSlugs = []

  const cur = db.collection('products').find({})
  while (await cur.hasNext()) {
    const p = await cur.next()
    scanned += 1
    const next = {}

    // Normalize primary category
    if (p.category && typeof p.category === 'object' && p.category._id) {
      next.category = new ObjectId(String(p.category._id))
    } else if (typeof p.category === 'string' && ObjectId.isValid(p.category)) {
      next.category = new ObjectId(p.category)
    }

    // Normalize categories array
    if (Array.isArray(p.categories)) {
      const out = []
      for (const v of p.categories) {
        if (v && typeof v === 'object' && v._id) {
          out.push(new ObjectId(String(v._id)))
        } else if (typeof v === 'string' && ObjectId.isValid(v)) {
          out.push(new ObjectId(v))
        } else if (ObjectId.isValid(v)) {
          out.push(new ObjectId(String(v)))
        }
      }
      if (out.length) {
        next.categories = Array.from(new Set(out.map((x) => x.toHexString()))).map(
          (x) => new ObjectId(x)
        )
      }
    }

    // Ensure Robera Pro has both Robera + Electric Carts
    if (p.slug === 'robera-pro' && roberaId && cartsId) {
      next.category = roberaId
      const base = Array.isArray(next.categories)
        ? next.categories
        : Array.isArray(p.categories)
        ? p.categories
            .map((x) => (x && x._id ? x._id : x))
            .filter((x) => ObjectId.isValid(String(x)))
            .map((x) => new ObjectId(String(x)))
        : []
      const merged = [roberaId, cartsId, ...base].map((x) => new ObjectId(String(x)))
      next.categories = Array.from(new Set(merged.map((x) => x.toHexString()))).map(
        (x) => new ObjectId(x)
      )
    }

    if (Object.keys(next).length) {
      await db.collection('products').updateOne({ _id: p._id }, { $set: next })
      normalized += 1
      touchedSlugs.push(p.slug)
    }
  }

  console.log(
    JSON.stringify(
      { dbName, scanned, normalized, touchedSlugs: touchedSlugs.slice(0, 20) },
      null,
      2
    )
  )

  await client.close()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


