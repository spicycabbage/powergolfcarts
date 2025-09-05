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

  // Define minimal Product schema compatible with existing collection
  const ProductSchema = new mongoose.Schema({
    name: String,
    productType: { type: String, enum: ['simple', 'variable'] },
    variants: [
      {
        name: String,
        value: String,
        originalPrice: Number,
        price: Number,
        inventory: Number,
        sku: String,
      },
    ],
  })
  const Product = mongoose.models.__WipeProduct || mongoose.model('__WipeProduct', ProductSchema, 'products')

  const dryRun = process.argv.includes('--dry') || process.argv.includes('--dry-run')

  const candidates = await Product.find({ 'variants.4': { $exists: true } }).select('_id name productType variants')
  console.log(`Found ${candidates.length} products with >=5 variants`)

  if (dryRun) {
    candidates.slice(0, 20).forEach((p) => {
      console.log(`- ${p._id} | ${p.name} | variants=${p.variants?.length || 0}`)
    })
    console.log('🛈 Dry run only. No data changed. Use --confirm to apply.')
    await mongoose.disconnect()
    return
  }

  if (!process.argv.includes('--confirm')) {
    console.log('⚠ Pass --confirm to actually wipe variants. You can also add --limit N')
    await mongoose.disconnect()
    return
  }

  const limitIdx = process.argv.findIndex((a) => a === '--limit')
  const limit = limitIdx !== -1 ? parseInt(process.argv[limitIdx + 1]) : undefined
  const list = typeof limit === 'number' && !isNaN(limit) ? candidates.slice(0, limit) : candidates

  let updated = 0
  for (const p of list) {
    await Product.updateOne(
      { _id: p._id },
      {
        $set: {
          variants: [],
          productType: 'simple',
        },
      }
    )
    updated += 1
  }
  console.log(`✅ Wiped variants for ${updated} products. Set productType='simple'.`)

  await mongoose.disconnect()
}

run().catch(async (e) => {
  console.error('❌ Error:', e)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})



