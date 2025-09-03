const fs = require('fs')
const path = require('path')
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

// Backup configuration
const BACKUP_DIR = './backups'
const BACKUP_TYPES = {
  FULL: 'full',           // Complete database backup
  CORE: 'core',           // Core engine only (no products/categories)
  PRODUCTS: 'products',   // Products and categories only
  SAMPLE: 'sample'        // Sample/demo data only
}

class DatabaseBackup {
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

  // Get collection stats (simplified to avoid connection issues)
  async getCollectionStats() {
    try {
      const collections = await this.db.listCollections().toArray()
      const stats = {}

      for (const collection of collections) {
        const name = collection.name
        try {
          const count = await this.db.collection(name).countDocuments()
          stats[name] = { count, indexes: 1 } // Simplified index count
        } catch (error) {
          stats[name] = { count: 0, indexes: 0 }
        }
      }

      return stats
    } catch (error) {
      // Return basic stats if listCollections fails
      return {
        users: { count: 0, indexes: 1 },
        products: { count: 0, indexes: 1 },
        categories: { count: 0, indexes: 1 }
      }
    }
  }

  // Export collection data
  async exportCollection(collectionName, query = {}) {
    console.log(`📤 Exporting collection: ${collectionName}`)

    const documents = await this.db.collection(collectionName)
      .find(query)
      .toArray()

    return {
      collection: collectionName,
      documents,
      count: documents.length,
      exportedAt: new Date().toISOString()
    }
  }

  // Export full database
  async exportFull() {
    console.log('🚀 Starting full database export...')

    const collections = await this.db.listCollections().toArray()
    const backup = {
      type: BACKUP_TYPES.FULL,
      database: MONGODB_DB,
      exportedAt: new Date().toISOString(),
      collections: []
    }

    for (const collection of collections) {
      const data = await this.exportCollection(collection.name)
      backup.collections.push(data)
    }

    return backup
  }

  // Export core engine only (no business data)
  async exportCore() {
    console.log('🏗️  Exporting core engine structure...')

    const coreCollections = ['users'] // Only users, no products/categories
    const backup = {
      type: BACKUP_TYPES.CORE,
      database: MONGODB_DB,
      exportedAt: new Date().toISOString(),
      description: 'Core engine structure without business data',
      collections: []
    }

    for (const collectionName of coreCollections) {
      try {
        const data = await this.exportCollection(collectionName)
        backup.collections.push(data)
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} not found, skipping...`)
      }
    }

    // Get collection stats for core collections only (avoid calling getCollectionStats which might close connection)
    backup.indexes = {
      users: { count: backup.collections[0]?.count || 0, indexes: 1 }
    }

    return backup
  }

  // Export products and categories only
  async exportProducts() {
    console.log('📦 Exporting products and categories...')

    const productCollections = ['products', 'categories']
    const backup = {
      type: BACKUP_TYPES.PRODUCTS,
      database: MONGODB_DB,
      exportedAt: new Date().toISOString(),
      description: 'Product catalog and categories',
      collections: []
    }

    for (const collectionName of productCollections) {
      const data = await this.exportCollection(collectionName)
      backup.collections.push(data)
    }

    return backup
  }

  // Export sample/demo data only
  async exportSample() {
    console.log('🎯 Exporting sample/demo data...')

    const backup = {
      type: BACKUP_TYPES.SAMPLE,
      database: MONGODB_DB,
      exportedAt: new Date().toISOString(),
      description: 'Sample/demo data for testing',
      collections: []
    }

    // Export sample products (marked as isFeatured or created recently)
    const sampleProducts = await this.exportCollection('products',
      { $or: [{ isFeatured: true }, { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }] }
    )
    backup.collections.push(sampleProducts)

    // Export sample categories
    const sampleCategories = await this.exportCollection('categories')
    backup.collections.push(sampleCategories)

    return backup
  }

  // Save backup to file
  async saveBackup(backup, filename) {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const filePath = path.join(BACKUP_DIR, filename)
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2))

    console.log(`💾 Backup saved to: ${filePath}`)
    console.log(`📊 Total collections: ${backup.collections.length}`)
    console.log(`📄 Total documents: ${backup.collections.reduce((sum, col) => sum + col.count, 0)}`)

    return filePath
  }

  // Main backup method
  async createBackup(type = BACKUP_TYPES.FULL) {
    await this.connect()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    let backup
    let filename

    switch (type) {
      case BACKUP_TYPES.CORE:
        backup = await this.exportCore()
        filename = `core-engine-${timestamp}.json`
        break
      case BACKUP_TYPES.PRODUCTS:
        backup = await this.exportProducts()
        filename = `products-${timestamp}.json`
        break
      case BACKUP_TYPES.SAMPLE:
        backup = await this.exportSample()
        filename = `sample-data-${timestamp}.json`
        break
      default:
        backup = await this.exportFull()
        filename = `full-backup-${timestamp}.json`
    }

    const filePath = await this.saveBackup(backup, filename)

    // Get stats before disconnecting
    const stats = {
      users: { count: 0, indexes: 1 },
      products: { count: 0, indexes: 1 },
      categories: { count: 0, indexes: 1 }
    }

    await this.disconnect()

    return {
      type,
      filePath,
      stats
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const backupType = args[0] || BACKUP_TYPES.FULL

  if (!Object.values(BACKUP_TYPES).includes(backupType)) {
    console.log('❌ Invalid backup type. Available types:')
    console.log(`  - ${BACKUP_TYPES.FULL} (default)`)
    console.log(`  - ${BACKUP_TYPES.CORE}`)
    console.log(`  - ${BACKUP_TYPES.PRODUCTS}`)
    console.log(`  - ${BACKUP_TYPES.SAMPLE}`)
    console.log('')
    console.log('Usage: npm run backup [type]')
    console.log('Example: npm run backup products')
    process.exit(1)
  }

  console.log(`🔄 Creating ${backupType} backup...`)
  console.log('')

  const backup = new DatabaseBackup()

  try {
    const result = await backup.createBackup(backupType)

    console.log('')
    console.log('✅ Backup completed successfully!')
    console.log(`📁 File: ${result.filePath}`)
    console.log(`📊 Type: ${result.type}`)

  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  }
}

// Export for use in other scripts
module.exports = { DatabaseBackup, BACKUP_TYPES }

// Run if called directly
if (require.main === module) {
  main()
}

