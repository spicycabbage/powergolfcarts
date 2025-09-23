require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

async function backup() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const backup = {};
    
    console.log(`Found ${collections.length} collections`);
    
    for (const col of collections) {
      console.log(`Backing up collection: ${col.name}`);
      const data = await db.collection(col.name).find({}).toArray();
      backup[col.name] = data;
      console.log(`  - ${data.length} documents`);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    console.log(`✅ Database backed up to: ${filename}`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backup();
