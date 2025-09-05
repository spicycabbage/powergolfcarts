// Normalize product.category and product.categories to ObjectId references
// - Converts slug strings or string ObjectIds to real ObjectIds
// - Ensures additional categories exclude primary
// Usage: node scripts/normalize-product-categories.js [--dry-run] [--product=nuken] [--category=indica]

const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
const mongoose = require('mongoose')

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const productsCol = db.collection('products')
  const categoriesCol = db.collection('categories')

  const categories = await categoriesCol.find({}).project({ _id: 1, slug: 1 }).toArray()
  const slugToId = new Map(categories.map(c => [String(c.slug), String(c._id)]))
  const idStrToId = new Map(categories.map(c => [String(c._id), String(c._id)]))

  // Filters
  const productArg = process.argv.find(a => a.startsWith('--product='))
  const categoryArg = process.argv.find(a => a.startsWith('--category='))
  const productFilter = productArg ? String(productArg.split('=')[1] || '').toLowerCase() : ''
  const categoryFilter = categoryArg ? String(categoryArg.split('=')[1] || '').toLowerCase() : ''
  const categoryFilterId = categoryFilter ? slugToId.get(categoryFilter) : undefined

  const baseQuery = productFilter
    ? { $or: [{ slug: productFilter }, { name: new RegExp(`^${productFilter}$`, 'i') }] }
    : {}
  const cursor = productsCol.find(baseQuery)
  let updated = 0
  let scanned = 0
  while (await cursor.hasNext()) {
    const p = await cursor.next()
    scanned++
    let primary = p.category
    let extras = Array.isArray(p.categories) ? p.categories.slice() : []

    const normalizeOne = (val) => {
      if (!val) return null
      const s = String(val)
      if (idStrToId.has(s)) return idStrToId.get(s)
      if (slugToId.has(s)) return slugToId.get(s)
      return null
    }

    const nextPrimary = normalizeOne(primary)
    const nextExtras = extras
      .map(normalizeOne)
      .filter(Boolean)

    // Dedupe and exclude primary
    const finalPrimary = nextPrimary || null
    const seen = new Set([finalPrimary].filter(Boolean))
    const finalExtras = nextExtras.filter(id => !seen.has(id) && (seen.add(id), true))

    // Apply optional category filter: include only products linked to the filter (before or after normalization)
    const matchesCategoryFilter = () => {
      if (!categoryFilter) return true
      const before = [String(primary), ...extras.map(String)]
      if (before.includes(categoryFilter) || before.includes(String(categoryFilterId || ''))) return true
      const after = [String(finalPrimary || ''), ...finalExtras.map(String)].filter(Boolean)
      if (after.includes(categoryFilter) || after.includes(String(categoryFilterId || ''))) return true
      return false
    }

    const needsUpdate = String(primary) !== String(finalPrimary || '') || JSON.stringify(extras.map(String)) !== JSON.stringify(finalExtras.map(String))
    if (needsUpdate && matchesCategoryFilter()) {
      updated++
      if (!dryRun && finalPrimary) {
        await productsCol.updateOne({ _id: p._id }, {
          $set: { category: new mongoose.Types.ObjectId(finalPrimary), categories: finalExtras.map(id => new mongoose.Types.ObjectId(id)) }
        })
      }
      console.log(`[${dryRun ? 'DRY' : 'FIX'}] ${p.slug || p._id}:`, {
        from: { category: String(primary), categories: extras.map(String) },
        to: { category: String(finalPrimary), categories: finalExtras.map(String) }
      })
    }
  }

  console.log(`Scanned ${scanned} products; ${updated} would be updated${dryRun ? ' (dry-run)' : ''}.`)
  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})


