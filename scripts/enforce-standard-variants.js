const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env.local')
  process.exit(1)
}

function normalize(s) {
  return (s || '').toString().toLowerCase()
}

function inSet(catId, idSet) {
  return idSet.has(String(catId))
}

function desiredWeightsFor(type) {
  if (type === 'flower_hash') return ['3.5g', '7g', '14g', '28g']
  if (type === 'shatter_diamonds') return ['1g', '7g', '14g', '28g']
  return []
}

function buildDesiredVariants(weights, product) {
  const baseSku = `SKU-${(product.slug || product.name || product._id).toString().replace(/[^a-z0-9]+/gi, '-').toUpperCase()}`
  return weights.map(w => ({
    name: 'Weight',
    value: w,
    price: undefined, // let admin set; keeps flexibility
    inventory: 0,
    sku: `${baseSku}-${w.replace(/\./g, '_').toUpperCase()}`
  }))
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  try {
    const cats = await db.collection('categories').find({}).project({ name: 1, slug: 1, parent: 1 }).toArray()
    const byId = new Map(cats.map(c => [String(c._id), c]))

    const matchAny = (c, patterns) => {
      const s = `${normalize(c.slug)} ${normalize(c.name)}`
      return patterns.some(p => s.includes(p))
    }

    const flowerHash = new Set()
    const shatterDiamonds = new Set()
    const edibles = new Set()

    // seed sets by slug/name patterns
    for (const c of cats) {
      if (matchAny(c, ['flower', 'flowers', 'hash'])) flowerHash.add(String(c._id))
      if (matchAny(c, ['shatter', 'shatters', 'diamond', 'diamonds', 'live-diamond', 'live diamonds'])) shatterDiamonds.add(String(c._id))
      if (matchAny(c, ['edible', 'edibles', 'gummies', 'chocolate'])) edibles.add(String(c._id))
    }

    // include children of each set (one hop)
    const includeChildren = (set) => {
      const parentIds = new Set(set)
      for (const c of cats) {
        if (c.parent && parentIds.has(String(c.parent))) set.add(String(c._id))
      }
    }
    includeChildren(flowerHash)
    includeChildren(shatterDiamonds)
    includeChildren(edibles)

    const products = await db.collection('products').find({}).project({ name: 1, slug: 1, category: 1, categories: 1, variants: 1, inventory: 1 }).toArray()

    const isCBDSimple = new Set(['cbd isolate 1g', 'cbd tincture 1000mg'])

    let updated = 0
    let examined = 0
    for (const p of products) {
      examined++
      if (isCBDSimple.has(normalize(p.name))) continue

      const catIds = new Set([String(p.category || ''), ...((p.categories || []).map(id => String(id)))])
      const isEdible = [...catIds].some(id => edibles.has(id))
      if (isEdible) continue // user will handle flavors

      const isFH = [...catIds].some(id => flowerHash.has(id))
      const isSD = [...catIds].some(id => shatterDiamonds.has(id))
      const type = isSD ? 'shatter_diamonds' : (isFH ? 'flower_hash' : null)
      if (!type) continue

      const neededWeights = desiredWeightsFor(type)
      const desired = buildDesiredVariants(neededWeights, p)

      const existing = Array.isArray(p.variants) ? p.variants : []
      const have = new Set(existing.map(v => `${normalize(v.name)}|${normalize(v.value)}`))
      const missing = desired.filter(v => !have.has(`${normalize(v.name)}|${normalize(v.value)}`))
      if (missing.length === 0) continue

      await db.collection('products').updateOne(
        { _id: new ObjectId(p._id) },
        {
          $push: { variants: { $each: missing } },
          $set: { 'inventory.trackInventory': false }
        }
      )
      updated++
    }

    console.log(`Examined: ${examined}`)
    console.log(`Products updated with standard variants: ${updated}`)
  } catch (e) {
    console.error('enforce-standard-variants failed:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  main()
}


