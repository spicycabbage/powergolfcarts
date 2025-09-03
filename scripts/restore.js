const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'
const BACKUP_DIR = './backups'

// Validate environment variables
if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  console.log('💡 Make sure your .env.local file contains:')
  console.log('   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/ecommerce')
  process.exit(1)
}

const RESTORE_MODES = {
  FULL: 'full',           // Complete restore (clear all, restore all)
  MERGE: 'merge',         // Merge with existing data
  REPLACE: 'replace',     // Replace specific collections only
  CORE: 'core'            // Restore core engine only
}

class DatabaseRestore {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    this.client = new MongoClient(MONGODB_URI)
    await this.client.connect()
    this.db = this.client.db(MONGODB_DB)
    console.log('✅ Connected to MongoDB')
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }

  // Load backup file
  loadBackup(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found: ${filePath}`)
    }

    console.log(`📂 Loading backup from: ${filePath}`)
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return backupData
  }

  // Clear all collections
  async clearAllCollections() {
    console.log('🧹 Clearing all existing data...')

    const collections = await this.db.listCollections().toArray()

    for (const collection of collections) {
      await this.db.collection(collection.name).deleteMany({})
      console.log(`  🗑️  Cleared collection: ${collection.name}`)
    }
  }

  // Clear specific collections
  async clearCollections(collectionNames) {
    console.log(`🧹 Clearing collections: ${collectionNames.join(', ')}`)

    for (const collectionName of collectionNames) {
      await this.db.collection(collectionName).deleteMany({})
      console.log(`  🗑️  Cleared collection: ${collectionName}`)
    }
  }

  // Restore collection data
  async restoreCollection(collectionData, mode = RESTORE_MODES.REPLACE) {
    const { collection, documents, count } = collectionData

    console.log(`📥 Restoring collection: ${collection} (${count} documents)`)

    if (mode === RESTORE_MODES.REPLACE) {
      await this.clearCollections([collection])
    }

    if (documents.length > 0) {
      await this.db.collection(collection).insertMany(documents)
      console.log(`  ✅ Restored ${documents.length} documents to ${collection}`)
    }
  }

  // Restore indexes
  async restoreIndexes(indexes) {
    console.log('🔧 Restoring database indexes...')

    for (const [collectionName, indexInfo] of Object.entries(indexes)) {
      // Note: In a real implementation, you'd recreate specific indexes
      // For now, we'll create standard indexes
      try {
        await this.createStandardIndexes(collectionName)
      } catch (error) {
        console.log(`  ⚠️  Could not create indexes for ${collectionName}: ${error.message}`)
      }
    }
  }

  // Create standard indexes for collections
  async createStandardIndexes(collectionName) {
    const collection = this.db.collection(collectionName)

    switch (collectionName) {
      case 'products':
        await collection.createIndex({ slug: 1 }, { unique: true })
        await collection.createIndex({ category: 1 })
        await collection.createIndex({ categories: 1 })
        await collection.createIndex({ isActive: 1 })
        await collection.createIndex({ isFeatured: 1 })
        await collection.createIndex({ price: 1 })
        await collection.createIndex({ name: 'text', description: 'text' })
        break
      case 'categories':
        await collection.createIndex({ slug: 1 }, { unique: true })
        await collection.createIndex({ parent: 1 })
        await collection.createIndex({ isActive: 1 })
        break
      case 'users':
        await collection.createIndex({ email: 1 }, { unique: true })
        await collection.createIndex({ role: 1 })
        break
    }
  }

  // Full restore (clear all, restore all)
  async restoreFull(backupData) {
    console.log('🚀 Starting full database restore...')

    await this.clearAllCollections()

    for (const collectionData of backupData.collections) {
      await this.restoreCollection(collectionData, RESTORE_MODES.REPLACE)
    }

    if (backupData.indexes) {
      await this.restoreIndexes(backupData.indexes)
    }

    console.log('✅ Full restore completed')
  }

  // Core engine restore (restore only core functionality)
  async restoreCore(backupData) {
    console.log('🏗️  Restoring core engine...')

    // Only restore users collection for core functionality
    const coreCollections = backupData.collections.filter(
      col => col.collection === 'users'
    )

    for (const collectionData of coreCollections) {
      await this.restoreCollection(collectionData, RESTORE_MODES.REPLACE)
    }

    console.log('✅ Core engine restore completed')
  }

  // Selective collection restore
  async restoreCollections(backupData, collectionNames) {
    console.log(`📦 Restoring selected collections: ${collectionNames.join(', ')}`)

    const selectedCollections = backupData.collections.filter(
      col => collectionNames.includes(col.collection)
    )

    for (const collectionData of selectedCollections) {
      await this.restoreCollection(collectionData, RESTORE_MODES.REPLACE)
    }

    console.log('✅ Selective restore completed')
  }

  // Main restore method
  async restore(backupPath, mode = RESTORE_MODES.FULL, collections = null) {
    await this.connect()

    const backupData = this.loadBackup(backupPath)

    console.log(`🔄 Starting ${mode} restore...`)
    console.log(`📊 Backup type: ${backupData.type}`)
    console.log(`📅 Exported: ${backupData.exportedAt}`)
    console.log(`📦 Collections: ${backupData.collections.length}`)
    console.log('')

    try {
      switch (mode) {
        case RESTORE_MODES.FULL:
          await this.restoreFull(backupData)
          break
        case RESTORE_MODES.CORE:
          await this.restoreCore(backupData)
          break
        case RESTORE_MODES.REPLACE:
          if (!collections || collections.length === 0) {
            throw new Error('Collections must be specified for REPLACE mode')
          }
          await this.restoreCollections(backupData, collections)
          break
        default:
          throw new Error(`Unknown restore mode: ${mode}`)
      }

      console.log('')
      console.log('✅ Restore completed successfully!')

    } catch (error) {
      console.error('❌ Restore failed:', error.message)
      throw error
    } finally {
      await this.disconnect()
    }
  }

  // Get available backups
  static getAvailableBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
      return []
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        }
      })
      .sort((a, b) => b.modified - a.modified)

    return files
  }

  // Clean restore (restore to factory state)
  async cleanRestore() {
    console.log('🧽 Performing clean restore (factory reset)...')

    await this.clearAllCollections()

    // Recreate indexes
    const collections = ['products', 'categories', 'users', 'orders', 'reviews']
    for (const collection of collections) {
      await this.createStandardIndexes(collection)
    }

    console.log('✅ Clean restore completed - database is now empty')
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Database Restore Tool')
    console.log('===================')
    console.log('')
    console.log('Available backups:')
    const backups = DatabaseRestore.getAvailableBackups()

    if (backups.length === 0) {
      console.log('  No backups found in ./backups directory')
      console.log('  Create a backup first: npm run backup')
    } else {
      backups.forEach((backup, index) => {
        const size = (backup.size / 1024).toFixed(1) + ' KB'
        const date = backup.modified.toISOString().split('T')[0]
        console.log(`  ${index + 1}. ${backup.name} (${size}) - ${date}`)
      })
    }

    console.log('')
    console.log('Usage:')
    console.log('  npm run restore <backup-file> [mode] [collections]')
    console.log('  npm run restore --clean')
    console.log('')
    console.log('Modes:')
    console.log('  full     - Complete restore (default)')
    console.log('  core     - Restore core engine only')
    console.log('  replace  - Replace specific collections')
    console.log('')
    console.log('Examples:')
    console.log('  npm run restore full-backup-2024-01-01T10-00-00.json')
    console.log('  npm run restore core-engine-2024-01-01T10-00-00.json core')
    console.log('  npm run restore products-2024-01-01T10-00-00.json replace products,categories')
    console.log('  npm run restore --clean')
    return
  }

  const restore = new DatabaseRestore()

  try {
    if (args[0] === '--clean') {
      await restore.connect()
      await restore.cleanRestore()
      await restore.disconnect()
      return
    }

    const backupFile = args[0]
    const mode = args[1] || RESTORE_MODES.FULL
    const collections = args[2] ? args[2].split(',') : null

    const backupPath = path.isAbsolute(backupFile)
      ? backupFile
      : path.join(BACKUP_DIR, backupFile)

    await restore.restore(backupPath, mode, collections)

  } catch (error) {
    console.error('❌ Restore failed:', error.message)
    process.exit(1)
  }
}

// Export for use in other scripts
module.exports = { DatabaseRestore, RESTORE_MODES }

// Run if called directly
if (require.main === module) {
  main()
}

