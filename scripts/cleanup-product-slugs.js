const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Slug generation function (matches the one in Product model)
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Make slug unique by adding counter if needed
async function makeUniqueSlug(products, baseSlug, excludeId = null) {
  let candidate = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await products.findOne({ 
      slug: candidate,
      ...(excludeId && { _id: { $ne: excludeId } })
    })
    
    if (!existing) {
      return candidate
    }
    
    counter++
    candidate = `${baseSlug}-${counter}`
  }
}

async function cleanupProductSlugs() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI)
  
  try {
    const db = mongoose.connection.db
    const products = db.collection('products')
    
    console.log('🔍 Analyzing product slugs...')
    
    // Get all products
    const allProducts = await products.find({}).toArray()
    console.log(`Found ${allProducts.length} total products`)
    
    // Find products with problematic slugs
    const issues = []
    
    for (const product of allProducts) {
      const currentSlug = product.slug
      const expectedSlug = generateSlug(product.name)
      
      if (currentSlug !== expectedSlug) {
        issues.push({
          _id: product._id,
          name: product.name,
          currentSlug,
          expectedSlug,
          isActive: product.isActive
        })
      }
    }
    
    console.log(`\n📊 Found ${issues.length} products with slug issues:`)
    console.log('=' .repeat(80))
    
    if (issues.length === 0) {
      console.log('✅ All product slugs are properly formatted!')
      return
    }
    
    // Show issues
    issues.forEach((issue, index) => {
      const status = issue.isActive ? '🟢' : '🔴'
      console.log(`\n${index + 1}. ${status} "${issue.name}"`)
      console.log(`   Current:  "${issue.currentSlug}"`)
      console.log(`   Expected: "${issue.expectedSlug}"`)
    })
    
    console.log('\n' + '=' .repeat(80))
    console.log('🔧 Cleanup Options:')
    console.log('1. DRY RUN - Show what would be changed (safe)')
    console.log('2. FIX ALL - Update all problematic slugs')
    console.log('3. FIX ACTIVE ONLY - Update only active products')
    console.log('4. MANUAL - Choose specific products to fix')
    
    // For now, let's do a dry run
    console.log('\n🧪 DRY RUN - Showing proposed changes:')
    console.log('=' .repeat(80))
    
    const updates = []
    
    for (const issue of issues) {
      const uniqueSlug = await makeUniqueSlug(products, issue.expectedSlug, issue._id)
      
      updates.push({
        _id: issue._id,
        name: issue.name,
        currentSlug: issue.currentSlug,
        newSlug: uniqueSlug,
        isActive: issue.isActive
      })
      
      const status = issue.isActive ? '🟢' : '🔴'
      console.log(`${status} "${issue.name}"`)
      console.log(`   ${issue.currentSlug} → ${uniqueSlug}`)
      
      if (uniqueSlug !== issue.expectedSlug) {
        console.log(`   ⚠️  Had to make unique: ${issue.expectedSlug} → ${uniqueSlug}`)
      }
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('💡 To actually apply these changes, run:')
    console.log('   node scripts/cleanup-product-slugs.js --fix-all')
    console.log('   node scripts/cleanup-product-slugs.js --fix-active')
    console.log('   node scripts/cleanup-product-slugs.js --fix-ids="id1,id2,id3"')
    
    // Check if user wants to apply changes
    const args = process.argv.slice(2)
    
    if (args.includes('--fix-all')) {
      console.log('\n🔧 APPLYING ALL CHANGES...')
      await applyUpdates(products, updates)
    } else if (args.includes('--fix-active')) {
      console.log('\n🔧 APPLYING CHANGES TO ACTIVE PRODUCTS ONLY...')
      const activeUpdates = updates.filter(u => u.isActive)
      await applyUpdates(products, activeUpdates)
    } else if (args.find(arg => arg.startsWith('--fix-ids='))) {
      const idsArg = args.find(arg => arg.startsWith('--fix-ids='))
      const ids = idsArg.split('=')[1].split(',')
      console.log(`\n🔧 APPLYING CHANGES TO SPECIFIC IDS: ${ids.join(', ')}`)
      const specificUpdates = updates.filter(u => ids.includes(u._id.toString()))
      await applyUpdates(products, specificUpdates)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

async function applyUpdates(products, updates) {
  console.log(`Updating ${updates.length} products...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const update of updates) {
    try {
      await products.updateOne(
        { _id: update._id },
        { $set: { slug: update.newSlug } }
      )
      console.log(`✅ Updated: "${update.name}" → ${update.newSlug}`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to update "${update.name}":`, error.message)
      errorCount++
    }
  }
  
  console.log(`\n📊 Results: ${successCount} updated, ${errorCount} failed`)
  
  if (successCount > 0) {
    console.log('🎉 Slug cleanup completed!')
    console.log('⚠️  Remember to:')
    console.log('   1. Update any hardcoded links to these products')
    console.log('   2. Set up 301 redirects for old URLs if needed')
    console.log('   3. Regenerate sitemap if you have one')
  }
}

cleanupProductSlugs()
