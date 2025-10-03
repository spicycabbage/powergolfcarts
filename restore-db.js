const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce';
const BACKUP_FILE = path.join(__dirname, 'backups/full-backup-2025-10-03T02-27-28-120Z/database-backup.json');

async function restoreDatabase() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env.local');
        process.exit(1);
    }

    console.log('📂 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(MONGODB_DB);
        
        // Restore each collection
        for (const collectionName in backupData) {
            const documents = backupData[collectionName];
            
            if (!Array.isArray(documents) || documents.length === 0) {
                console.log(`⏭️  Skipping empty collection: ${collectionName}`);
                continue;
            }
            
            console.log(`\n📦 Restoring ${collectionName}...`);
            
            // Drop existing collection
            try {
                await db.collection(collectionName).drop();
                console.log(`  🗑️  Dropped existing ${collectionName}`);
            } catch (err) {
                // Collection might not exist, that's fine
                console.log(`  ℹ️  Collection ${collectionName} didn't exist`);
            }
            
            // Insert documents
            const result = await db.collection(collectionName).insertMany(documents);
            console.log(`  ✅ Restored ${result.insertedCount} documents to ${collectionName}`);
        }
        
        console.log('\n✅ Database restored successfully!');
        
        // Verify restoration
        console.log('\n🔍 Verification:');
        const categories = await db.collection('categories').countDocuments();
        const products = await db.collection('products').countDocuments();
        console.log(`  Categories: ${categories}`);
        console.log(`  Products: ${products}`);
        
        const roberaPro = await db.collection('products').findOne({ slug: 'robera-pro' });
        if (roberaPro) {
            console.log(`  ✅ Robera Pro found: ${roberaPro.name}`);
            console.log(`     Category: ${roberaPro.category}`);
        }
        
    } catch (error) {
        console.error('❌ Error restoring database:', error);
    } finally {
        await client.close();
    }
}

restoreDatabase();

