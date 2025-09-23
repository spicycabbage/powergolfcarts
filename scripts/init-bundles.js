const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import the Bundle model
const Bundle = require('../src/models/Bundle.js').default

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

const bundleData = [
  {
    name: 'Flower 4x28g Bundle',
    slug: 'flower-28g',
    description: 'Choose any 4 flower products (28g each) and get 15% off automatically!',
    skuFilter: 'FLO28G',
    category: 'flower',
    size: '28g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 1,
    seoTitle: 'Flower 28g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 flower products (28g each). Premium cannabis flower bundle deals.',
    focusKeyphrase: 'flower 28g bundle'
  },
  {
    name: 'Hash 4x28g Bundle',
    slug: 'hash-28g',
    description: 'Choose any 4 hash products (28g each) and get 15% off automatically!',
    skuFilter: 'HAS28G',
    category: 'hash',
    size: '28g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 2,
    seoTitle: 'Hash 28g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 hash products (28g each). Premium cannabis hash bundle deals.',
    focusKeyphrase: 'hash 28g bundle'
  },
  {
    name: 'Shatter 4x28g Bundle',
    slug: 'shatter-28g',
    description: 'Choose any 4 shatter products (28g each) and get 15% off automatically!',
    skuFilter: 'SHA28G',
    category: 'shatter',
    size: '28g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 3,
    seoTitle: 'Shatter 28g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 shatter products (28g each). Premium cannabis concentrate bundle deals.',
    focusKeyphrase: 'shatter 28g bundle'
  },
  {
    name: 'Flower 4x7g Bundle',
    slug: 'flower-7g',
    description: 'Choose any 4 flower products (7g each) and get 15% off automatically!',
    skuFilter: 'FLO07G',
    category: 'flower',
    size: '7g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 4,
    seoTitle: 'Flower 7g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 flower products (7g each). Premium cannabis flower bundle deals.',
    focusKeyphrase: 'flower 7g bundle'
  },
  {
    name: 'Hash 4x7g Bundle',
    slug: 'hash-7g',
    description: 'Choose any 4 hash products (7g each) and get 15% off automatically!',
    skuFilter: 'HAS07G',
    category: 'hash',
    size: '7g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 5,
    seoTitle: 'Hash 7g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 hash products (7g each). Premium cannabis hash bundle deals.',
    focusKeyphrase: 'hash 7g bundle'
  },
  {
    name: 'Shatter 4x7g Bundle',
    slug: 'shatter-7g',
    description: 'Choose any 4 shatter products (7g each) and get 15% off automatically!',
    skuFilter: 'SHA07G',
    category: 'shatter',
    size: '7g',
    requiredQuantity: 4,
    discountPercentage: 15,
    sortOrder: 6,
    seoTitle: 'Shatter 7g Bundle - 4 for 15% Off | Godbud.cc',
    metaDescription: 'Save 15% when you buy 4 shatter products (7g each). Premium cannabis concentrate bundle deals.',
    focusKeyphrase: 'shatter 7g bundle'
  }
]

async function initBundles() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    console.log('🗑️  Clearing existing bundles...')
    await Bundle.deleteMany({})

    console.log('📦 Creating bundle configurations...')
    for (const bundle of bundleData) {
      const newBundle = new Bundle(bundle)
      await newBundle.save()
      console.log(`  ✅ Created: ${bundle.name}`)
    }

    console.log('')
    console.log('✅ Bundle initialization completed successfully!')
    console.log(`📊 Created ${bundleData.length} bundle configurations`)

  } catch (error) {
    console.error('❌ Bundle initialization failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the initialization
initBundles()

