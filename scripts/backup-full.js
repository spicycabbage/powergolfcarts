#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const BACKUP_DIR = path.join(__dirname, '..', 'backups')

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

async function createFullBackup(purpose = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = `full-backup-${timestamp}`
  const backupPath = path.join(BACKUP_DIR, backupName)
  
  console.log(`🚀 Creating full backup: ${backupName}`)
  console.log(`📁 Backup location: ${backupPath}`)
  
  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true })
  
  try {
    // 1. Backup codebase
    console.log('📦 Creating codebase backup...')
    const codebaseBackupPath = path.join(backupPath, 'codebase-backup.tar.gz')
    
    // Create tar.gz of entire project (excluding node_modules, .git, backups)
    execSync(`tar -czf "${codebaseBackupPath}" --exclude=node_modules --exclude=.git --exclude=backups --exclude=.next --exclude=.vercel --exclude=temp_restore --exclude=*.csv .`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })
    
    // 2. Backup database
    console.log('🗄️  Creating database backup...')
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db()
    const collections = await db.listCollections().toArray()
    
    const databaseBackup = {
      timestamp: new Date().toISOString(),
      collections: {}
    }
    
    for (const collection of collections) {
      const collectionName = collection.name
      console.log(`  📋 Backing up collection: ${collectionName}`)
      
      const documents = await db.collection(collectionName).find({}).toArray()
      databaseBackup.collections[collectionName] = documents
    }
    
    await client.close()
    
    // Save database backup
    const dbBackupPath = path.join(backupPath, 'database-backup.json')
    fs.writeFileSync(dbBackupPath, JSON.stringify(databaseBackup, null, 2))
    
    // 3. Save git information
    console.log('📝 Saving git information...')
    const gitInfo = {
      commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
      message: execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim(),
      date: execSync('git log -1 --pretty=%cd', { encoding: 'utf8' }).trim()
    }
    
    const gitInfoPath = path.join(backupPath, 'git-info.json')
    fs.writeFileSync(gitInfoPath, JSON.stringify(gitInfo, null, 2))
    
    // 4. Create manifest
    console.log('📋 Creating backup manifest...')
    const manifest = {
      timestamp: new Date().toISOString(),
      type: 'full-backup',
      ...(purpose && { purpose }),
      git: gitInfo,
      database: {
        collections: collections.map(c => ({
          name: c.name,
          documentCount: databaseBackup.collections[c.name].length
        }))
      },
      files: [
        {
          name: 'codebase-backup.tar.gz',
          size: fs.statSync(codebaseBackupPath).size
        },
        {
          name: 'database-backup.json',
          size: fs.statSync(dbBackupPath).size
        },
        {
          name: 'git-info.json',
          size: fs.statSync(gitInfoPath).size
        }
      ]
    }
    
    const manifestPath = path.join(backupPath, 'backup-manifest.json')
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    
    console.log('✅ Full backup completed successfully!')
    console.log(`📁 Backup saved to: ${backupPath}`)
    console.log(`🔍 Manifest: ${manifestPath}`)
    
    return backupPath
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    
    // Clean up failed backup
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true })
    }
    
    throw error
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const purposeIndex = args.indexOf('--purpose')
const purpose = purposeIndex !== -1 && args[purposeIndex + 1] ? args[purposeIndex + 1] : ''

if (args.includes('--help')) {
  console.log(`
Usage: node backup-full.js [options]

Options:
  --purpose <description>  Add a purpose description to the backup
  --help                   Show this help message

Examples:
  node backup-full.js --purpose "Before major refactor"
  node backup-full.js --purpose "Working state before bundle feature"
`)
  process.exit(0)
}

// Run backup
createFullBackup(purpose)
  .then(() => {
    console.log('🎉 Backup process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Backup process failed:', error)
    process.exit(1)
  })
