const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
// Derive DB name from URI path if present; else fallback to env or default
function getDbNameFromUri(uri) {
    try {
        const m = String(uri).match(/^mongodb(?:\+srv)?:\/\/[^/]+\/(\w+)(?:\?|$)/)
        return m && m[1] ? m[1] : null
    } catch {
        return null
    }
}
const derivedDb = getDbNameFromUri(MONGODB_URI)
const MONGODB_DB = derivedDb || process.env.MONGODB_DB || 'ecommerce';
const BACKUP_FILE = path.join(__dirname, 'backups/full-backup-2025-10-03T02-27-28-120Z/database-backup.json');

function reviveIds(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    if (Array.isArray(doc)) return doc.map(reviveIds);
    const out = {};
    for (const [k, v] of Object.entries(doc)) {
        if (k === '_id' || k === 'parent' || k === 'category') {
            out[k] = /^[0-9a-fA-F]{24}$/.test(String(v)) ? new ObjectId(String(v)) : v;
        } else if (k === 'categories' || k === 'children' || k === 'reviews') {
            out[k] = Array.isArray(v) ? v.map(x => (/^[0-9a-fA-F]{24}$/.test(String(x)) ? new ObjectId(String(x)) : x)) : v;
        } else if (typeof v === 'object' && v !== null) {
            out[k] = reviveIds(v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

async function restoreDatabase() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env.local');
        process.exit(1);
    }

    console.log('📂 Reading backup file...');
    const backupJson = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    const collections = backupJson.collections || backupJson;
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(MONGODB_DB);
        console.log(`🗄️  Target database: ${MONGODB_DB}`)
        
        const names = Object.keys(collections);
        for (const name of names) {
            const docs = collections[name];
            if (!Array.isArray(docs)) {
                console.log(`⏭️  Skipping non-array collection: ${name}`);
                continue;
            }
            console.log(`\n📦 Restoring ${name} (${docs.length} documents)...`);
            try { await db.collection(name).drop(); } catch {}
            if (docs.length === 0) { console.log('  (empty)'); continue; }
            const revived = docs.map(reviveIds);
            const result = await db.collection(name).insertMany(revived);
            console.log(`  ✅ Inserted ${result.insertedCount} docs into ${name}`);
        }
        
        console.log('\n✅ Database restored successfully!');
        const categories = await db.collection('categories').countDocuments();
        const products = await db.collection('products').countDocuments();
        console.log(`  Categories: ${categories}`);
        console.log(`  Products: ${products}`);
    } catch (error) {
        console.error('❌ Error restoring database:', error);
    } finally {
        await client.close();
    }
}

restoreDatabase();

