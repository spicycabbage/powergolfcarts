// Quick diagnostic: verify product-category linkage for a given product and category slug
// Usage: node scripts/debug-category-link.js [productNameOrSlug] [categorySlug]

const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
const mongoose = require('mongoose')

async function main() {
  const productKey = process.argv[2] || 'nuken'
  const categorySlug = process.argv[3] || 'indica'

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const productsCol = db.collection('products')
  const categoriesCol = db.collection('categories')

  const category = await categoriesCol.findOne({ slug: categorySlug })
  if (!category) {
    console.log(`Category '${categorySlug}' not found`)
  } else {
    console.log('Category:', { _id: String(category._id), slug: category.slug, name: category.name })
  }

  const product = await productsCol.findOne({
    $or: [
      { slug: productKey },
      { name: new RegExp(`^${productKey}$`, 'i') }
    ]
  })
  if (!product) {
    console.log(`Product '${productKey}' not found`)
    await mongoose.disconnect()
    return
  }
  const toIdStr = (x) => (x ? String(x) : x)
  const primary = toIdStr(product.category)
  const extras = Array.isArray(product.categories) ? product.categories.map(toIdStr) : []
  console.log('Product:', {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    isActive: product.isActive,
    category: primary,
    categories: extras,
  })

  if (category) {
    const catIdStr = String(category._id)
    const matches = primary === catIdStr || extras.includes(catIdStr) || primary === category.slug || extras.includes(category.slug)
    console.log('Linked to category?', matches)
  }

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})



