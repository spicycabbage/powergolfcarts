const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
const mongoose = require('mongoose')

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Define it in .env.local or your environment.')
    process.exit(1)
  }
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  }, { timestamps: true })

  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)

  const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')

  const parents = [
    { name: 'Flowers', children: ['Indica', 'Sativa', 'Hybrid'] },
    { name: 'Concentrates', children: ['Shatters', 'Diamonds'] },
    { name: 'Edibles', children: [] },
    { name: 'Hash', children: [] },
    { name: 'CBD', children: [] },
  ]

  const parentIdMap = new Map()

  // Ensure system Uncategorized exists first
  await Category.findOneAndUpdate(
    { slug: 'uncategorized', parent: null },
    { $setOnInsert: { name: 'Uncategorized', slug: 'uncategorized', parent: null, isSystem: true, isActive: true, seo: { title: 'Uncategorized', description: 'Default category', keywords: ['uncategorized'] } } },
    { new: true, upsert: true }
  )

  // Upsert parents
  for (const p of parents) {
    const slug = toSlug(p.name)
    const update = {
      name: p.name,
      slug,
      isActive: true,
      seo: { title: p.name, description: `${p.name} products`, keywords: [] },
    }
    const parent = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: update },
      { new: true, upsert: true }
    )
    parentIdMap.set(p.name, parent._id)
  }

  // Upsert children
  for (const p of parents) {
    const parentId = parentIdMap.get(p.name)
    for (const c of p.children) {
      const slug = toSlug(c)
      const update = {
        name: c,
        slug,
        parent: parentId,
        isActive: true,
        seo: { title: c, description: `${c} products`, keywords: [] },
      }
      await Category.findOneAndUpdate(
        { slug },
        { $setOnInsert: update },
        { new: true, upsert: true }
      )
    }
  }

  const total = await Category.countDocuments()
  console.log(`✅ Seeding complete. Category count: ${total}`)
  await mongoose.disconnect()
}

run().catch(async (e) => {
  console.error('❌ Error:', e)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})

