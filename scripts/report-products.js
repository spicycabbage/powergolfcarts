const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env.local')
  process.exit(1)
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  try {
    const products = await db.collection('products').find({}).project({
      name: 1,
      slug: 1,
      category: 1,
      variants: 1,
    }).toArray()

    // Build category lookup
    const catIds = Array.from(new Set(products.map(p => String(p.category)).filter(Boolean)))
    const categories = await db.collection('categories').find({ _id: { $in: catIds.map(id => new ObjectId(id)) } }).project({ name: 1, slug: 1 }).toArray()
    const catMap = new Map(categories.map(c => [String(c._id), { name: c.name, slug: c.slug }]))

    const lines = []
    lines.push(['name', 'slug', 'category_name', 'category_slug', 'variant_count'].join(','))
    for (const p of products) {
      const cat = catMap.get(String(p.category)) || { name: '', slug: '' }
      const variantCount = Array.isArray(p.variants) ? p.variants.length : 0
      const row = [p.name, p.slug, cat.name, cat.slug, String(variantCount)]
        .map(v => {
          if (v == null) return ''
          const s = String(v)
          return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s
        })
        .join(',')
      lines.push(row)
    }

    const outDir = path.join(process.cwd(), 'reports')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const outPath = path.join(outDir, `products-report-${ts}.csv`)
    fs.writeFileSync(outPath, lines.join('\n'))
    console.log(outPath)
  } catch (e) {
    console.error('Report generation failed:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  main()
}


