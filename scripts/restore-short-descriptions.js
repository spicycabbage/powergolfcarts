#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function restoreShortDescriptions(backupFile) {
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`)
    process.exit(1)
  }

  console.log(`📂 Loading backup from: ${backupFile}`)
  
  let backupData
  try {
    const backupContent = fs.readFileSync(backupFile, 'utf8')
    backupData = JSON.parse(backupContent)
  } catch (error) {
    console.error('❌ Failed to parse backup file:', error.message)
    process.exit(1)
  }

  // Extract products from backup
  const backupProducts = backupData.collections?.products || []
  if (backupProducts.length === 0) {
    console.error('❌ No products found in backup')
    process.exit(1)
  }

  console.log(`📦 Found ${backupProducts.length} products in backup`)

  // Connect to current database
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()
  const productsCollection = db.collection('products')

  let restoredCount = 0
  let skippedCount = 0

  for (const backupProduct of backupProducts) {
    const { _id, shortDescription, name } = backupProduct

    // Skip if no shortDescription in backup
    if (!shortDescription || shortDescription.trim() === '') {
      skippedCount++
      continue
    }

    try {
      // Update only the shortDescription field
      const result = await productsCollection.updateOne(
        { _id: _id },
        { 
          $set: { 
            shortDescription: shortDescription,
            updatedAt: new Date()
          } 
        }
      )

      if (result.matchedCount > 0) {
        console.log(`✅ Restored shortDescription for: ${name}`)
        restoredCount++
      } else {
        console.log(`⚠️  Product not found in current DB: ${name}`)
        skippedCount++
      }
    } catch (error) {
      console.error(`❌ Failed to restore ${name}:`, error.message)
      skippedCount++
    }
  }

  await client.close()

  console.log(`\n🎉 Restoration complete!`)
  console.log(`✅ Restored: ${restoredCount} products`)
  console.log(`⚠️  Skipped: ${skippedCount} products`)
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
Usage: node restore-short-descriptions.js <backup-file>

Examples:
  node restore-short-descriptions.js backups/full-backup-2025-09-15T12-31-25.json
  node restore-short-descriptions.js backups/full-backup-2025-09-16T01-40-53.json

Available backups:`)
  
  const backupDir = path.join(__dirname, '..', 'backups')
  const backupFiles = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json') && f.includes('full-backup'))
    .sort()
    .reverse() // Most recent first
  
  backupFiles.forEach(file => {
    console.log(`  - backups/${file}`)
  })
  
  process.exit(0)
}

const backupFile = path.resolve(args[0])

// Run restoration
restoreShortDescriptions(backupFile)
  .then(() => {
    console.log('🎉 Short descriptions restored successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Restoration failed:', error)
    process.exit(1)
  })
