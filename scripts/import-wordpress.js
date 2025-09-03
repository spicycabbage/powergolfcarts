const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

// Validate environment variables
if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  console.log('💡 Make sure your .env.local file contains:')
  console.log('   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/ecommerce')
  process.exit(1)
}

// Import stats
let stats = {
  processed: 0,
  imported: 0,
  skipped: 0,
  errors: 0
}

// WooCommerce meta key mappings
const WOO_META_KEYS = {
  '_regular_price': 'regular_price',
  '_sale_price': 'sale_price',
  '_price': 'price',
  '_sku': 'sku',
  '_stock_status': 'stock_status',
  '_stock': 'stock_quantity',
  '_manage_stock': 'manage_stock',
  '_weight': 'weight',
  '_length': 'length',
  '_width': 'width',
  '_height': 'height',
  '_product_image_gallery': 'gallery_images',
  '_thumbnail_id': 'thumbnail_id',
  '_product_attributes': 'attributes',
  '_visibility': 'visibility',
  '_featured': 'featured'
}

// Extract WooCommerce meta data from postmeta
function extractWooCommerceMeta(postmeta) {
  const meta = {}

  if (postmeta && Array.isArray(postmeta)) {
    postmeta.forEach(item => {
      const key = item['wp:meta_key']?.[0]
      const value = item['wp:meta_value']?.[0]

      if (key && value && WOO_META_KEYS[key]) {
        meta[WOO_META_KEYS[key]] = value
      }
    })
  }

  return meta
}

// Process categories from WordPress categories
async function processCategories(db, categories) {
  if (!categories || !Array.isArray(categories)) return []

  const categoryIds = []

  for (const category of categories) {
    const categoryName = category._ || category['wp:cat_name']?.[0] || category
    if (!categoryName || typeof categoryName !== 'string') continue

    // Check if category already exists
    let existingCategory = await db.collection('categories').findOne({
      name: categoryName.trim(),
      isActive: true
    })

    if (!existingCategory) {
      // Create new category
      const categorySlug = categoryName
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')

      existingCategory = {
        name: categoryName.trim(),
        slug: categorySlug,
        description: `Products in ${categoryName.trim()} category`,
        seo: {
          title: `${categoryName.trim()} - E-Commerce Store`,
          description: `Shop ${categoryName.trim().toLowerCase()} products at our online store`,
          keywords: [categoryName.trim().toLowerCase(), 'products', 'shopping']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await db.collection('categories').insertOne(existingCategory)
      existingCategory._id = result.insertedId
    }

    categoryIds.push(existingCategory._id)
  }

  return categoryIds
}

// Process images from WordPress attachments
async function processImages(db, item) {
  const images = []

  // Get featured image (thumbnail)
  const thumbnailId = item['wp:postmeta']?.find(
    meta => meta['wp:meta_key']?.[0] === '_thumbnail_id'
  )?.['wp:meta_value']?.[0]

  if (thumbnailId) {
    // In a real implementation, you'd fetch the attachment URL
    // For now, we'll create a placeholder
    images.push({
      url: `/wordpress-images/${thumbnailId}.jpg`,
      alt: item.title?.[0] || 'Product image',
      width: 800,
      height: 800,
      isPrimary: true
    })
  }

  // Get gallery images
  const galleryMeta = item['wp:postmeta']?.find(
    meta => meta['wp:meta_key']?.[0] === '_product_image_gallery'
  )

  if (galleryMeta?.['wp:meta_value']?.[0]) {
    const galleryIds = galleryMeta['wp:meta_value'][0].split(',')
    for (const imageId of galleryIds) {
      if (imageId.trim()) {
        images.push({
          url: `/wordpress-images/${imageId.trim()}.jpg`,
          alt: item.title?.[0] || 'Product gallery image',
          width: 800,
          height: 800,
          isPrimary: false
        })
      }
    }
  }

  return images
}

// Generate slug from name
function generateSlug(name) {
  if (!name || typeof name !== 'string') return 'product'
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Process individual WordPress item
async function processWordPressItem(db, item) {
  try {
    stats.processed++

    // Only process products (skip posts, pages, etc.)
    const postType = item['wp:post_type']?.[0]
    if (postType !== 'product') {
      console.log(`⏭️  Skipping item ${stats.processed}: Not a product (type: ${postType})`)
      stats.skipped++
      return
    }

    const title = item.title?.[0]
    if (!title) {
      console.log(`⏭️  Skipping item ${stats.processed}: No title`)
      stats.skipped++
      return
    }

    // Extract WooCommerce meta data
    const wooMeta = extractWooCommerceMeta(item['wp:postmeta'])
    const sku = wooMeta.sku || `WP-${item['wp:post_id']?.[0]}`

    // Check if product already exists
    const existingProduct = await db.collection('products').findOne({
      $or: [
        { sku: sku },
        { name: title }
      ]
    })

    if (existingProduct) {
      console.log(`⏭️  Skipping "${title}": Already exists`)
      stats.skipped++
      return
    }

    // Process categories
    const categoryIds = await processCategories(db, item.category)

    // Process images
    const images = await processImages(db, item)

    // Process pricing
    const regularPrice = parseFloat(wooMeta.regular_price) || 0
    const salePrice = parseFloat(wooMeta.sale_price) || null
    const price = parseFloat(wooMeta.price) || regularPrice

    // Process inventory
    const stockStatus = wooMeta.stock_status || 'instock'
    const stockQuantity = parseInt(wooMeta.stock_quantity) || 0
    const manageStock = wooMeta.manage_stock === 'yes'

    // Generate slug
    const slug = generateSlug(title)

    // Check for slug conflicts
    let finalSlug = slug
    let counter = 1
    while (await db.collection('products').findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Extract description
    const content = item['content:encoded']?.[0] || ''
    const excerpt = item['excerpt:encoded']?.[0] || ''

    // Create product object
    const product = {
      name: title,
      slug: finalSlug,
      description: content,
      shortDescription: excerpt,
      price: price,
      originalPrice: salePrice && salePrice > price ? regularPrice : null,
      images: images,
      category: categoryIds.length > 0 ? categoryIds[0] : null,
      categories: categoryIds,
      tags: [], // Could be extracted from tags if available
      inventory: {
        quantity: stockStatus === 'instock' ? stockQuantity : 0,
        lowStockThreshold: 5,
        sku: sku,
        trackInventory: manageStock
      },
      seo: {
        // Keep SEO fields editable and simple; Keyphrase stored as first keyword
        title: `${title} - E-Commerce Store`,
        description: excerpt || content.substring(0, 160) || `Shop ${title} at our online store`,
        keywords: [title.toLowerCase()],
      },
      variants: [], // Could be processed from WooCommerce variations
      reviews: [],
      averageRating: 0,
      reviewCount: 0,
      isActive: item['wp:status']?.[0] === 'publish',
      isFeatured: wooMeta.featured === 'yes',
      createdAt: new Date(item['wp:post_date']?.[0] || Date.now()),
      updatedAt: new Date(item['wp:post_date']?.[0] || Date.now()),

      // Additional WordPress fields
      wordpressId: item['wp:post_id']?.[0],
      wordpressMeta: wooMeta,
      weight: parseFloat(wooMeta.weight) || null,
      dimensions: {
        length: parseFloat(wooMeta.length) || null,
        width: parseFloat(wooMeta.width) || null,
        height: parseFloat(wooMeta.height) || null
      }
    }

    // Insert product
    const result = await db.collection('products').insertOne(product)
    console.log(`✅ Imported "${title}" (${result.insertedId})`)
    stats.imported++

  } catch (error) {
    console.error(`❌ Error processing item "${item.title?.[0] || 'Unknown'}":`, error.message)
    stats.errors++
  }
}

// Helper: read a single meta value by key
function getMetaValue(postmeta, key) {
  if (!Array.isArray(postmeta)) return undefined
  const found = postmeta.find(m => m['wp:meta_key']?.[0] === key)
  return found ? found['wp:meta_value']?.[0] : undefined
}

// Build a simple variant object from a WooCommerce product_variation item
function buildVariantFromVariation(item) {
  const postmeta = item['wp:postmeta'] || []
  // Price
  const priceStr = getMetaValue(postmeta, '_price') || getMetaValue(postmeta, '_regular_price')
  const price = priceStr ? parseFloat(priceStr) : undefined
  // SKU
  const sku = getMetaValue(postmeta, '_sku') || `VAR-${item['wp:post_id']?.[0]}`
  // Stock
  const stockStr = getMetaValue(postmeta, '_stock')
  const inventory = stockStr ? parseInt(stockStr) : 0
  // Attributes (collect all attribute_* metas)
  const attrs = []
  for (const m of postmeta) {
    const k = m['wp:meta_key']?.[0] || ''
    if (k.startsWith('attribute_')) {
      const v = m['wp:meta_value']?.[0]
      if (v) {
        attrs.push({ key: k.replace('attribute_', ''), value: v })
      }
    }
  }
  let name = 'variant'
  let value = ''
  if (attrs.length > 0) {
    name = attrs.map(a => a.key).join('|')
    value = attrs.map(a => a.value).join('|')
  }
  return { name, value, price, inventory: isNaN(inventory) ? 0 : inventory, sku }
}

async function processVariation(db, item) {
  const postType = item['wp:post_type']?.[0]
  if (postType !== 'product_variation') return { skipped: true }
  const parentId = item['wp:post_parent']?.[0]
  if (!parentId) return { skipped: true }

  // Find parent product by stored wordpressId
  const parent = await db.collection('products').findOne({ wordpressId: parentId })
  if (!parent) return { skipped: true }

  const variant = buildVariantFromVariation(item)

  // Avoid duplicate variants by sku
  const exists = (parent.variants || []).some(v => v.sku === variant.sku)
  if (exists) return { updated: false }

  // Push variant
  await db.collection('products').updateOne(
    { _id: parent._id },
    {
      $push: { variants: variant },
      // Optionally normalize product price to min variant price
      $set: {
        price: typeof variant.price === 'number' && (!parent.price || variant.price < parent.price)
          ? variant.price
          : parent.price || variant.price || 0,
        // For variable products, disable product-level inventory tracking
        'inventory.trackInventory': false
      }
    }
  )
  return { updated: true }
}

// Main import function
async function importWordPressXML(xmlFilePath) {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(MONGODB_DB)

    console.log('🚀 Starting WordPress XML product import...')
    console.log(`📁 Reading from: ${xmlFilePath}`)
    console.log('')

    // Read XML file
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8')

    // Parse XML
    const parser = new xml2js.Parser({
      explicitArray: true,
      ignoreAttrs: false,
      mergeAttrs: false
    })

    const result = await parser.parseStringPromise(xmlData)

    // Extract items from RSS feed
    const items = result.rss?.channel?.[0]?.item || []

    console.log(`📊 Found ${items.length} items in XML`)
    console.log('')

    // First pass: products
    for (const item of items) {
      await processWordPressItem(db, item)
    }

    // Second pass: variations (attach to parents)
    let variationsProcessed = 0
    for (const item of items) {
      if (item['wp:post_type']?.[0] === 'product_variation') {
        const r = await processVariation(db, item)
        if (r && r.updated) variationsProcessed++
      }
    }

    console.log('')
    console.log('📈 Import Summary:')
    console.log(`✅ Imported: ${stats.imported}`)
    console.log(`⏭️  Skipped: ${stats.skipped}`)
    console.log(`❌ Errors: ${stats.errors}`)
    console.log(`📊 Total processed: ${stats.processed}`)
    if (variationsProcessed) {
      console.log(`🧩 Variations attached: ${variationsProcessed}`)
    }

    // Create indexes for performance
    console.log('')
    console.log('🔧 Creating database indexes...')
    await db.collection('products').createIndex({ slug: 1 }, { unique: true })
    await db.collection('products').createIndex({ category: 1 })
    await db.collection('products').createIndex({ categories: 1 })
    await db.collection('products').createIndex({ isActive: 1 })
    await db.collection('products').createIndex({ isFeatured: 1 })
    await db.collection('products').createIndex({ price: 1 })
    await db.collection('products').createIndex({ name: 'text', description: 'text' })

    await db.collection('categories').createIndex({ slug: 1 }, { unique: true })
    await db.collection('categories').createIndex({ parent: 1 })
    await db.collection('categories').createIndex({ isActive: 1 })

    console.log('✅ Database indexes created')

  } catch (error) {
    console.error('💥 Import failed:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// CLI usage
const xmlFilePath = process.argv[2]

if (!xmlFilePath) {
  console.log('Usage: node scripts/import-wordpress.js <path-to-xml-file>')
  console.log('')
  console.log('Example:')
  console.log('  node scripts/import-wordpress.js ./data/wordpress-export.xml')
  console.log('')
  console.log('WordPress Export Instructions:')
  console.log('1. Go to WordPress Admin → Tools → Export')
  console.log('2. Choose "Products" or "All content"')
  console.log('3. Download the XML file')
  console.log('4. Run this script with the XML file path')
  console.log('')
  console.log('Supported WooCommerce Fields:')
  console.log('  ✅ Product name, description, prices')
  console.log('  ✅ Categories, images, inventory')
  console.log('  ✅ SKU, weight, dimensions')
  console.log('  ✅ Featured products, visibility')
  process.exit(1)
}

if (!fs.existsSync(xmlFilePath)) {
  console.error(`❌ XML file not found: ${xmlFilePath}`)
  process.exit(1)
}

importWordPressXML(xmlFilePath)
