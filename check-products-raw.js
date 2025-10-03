const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function checkProducts() {
    console.log('MongoDB URI:', MONGODB_URI);
    console.log('Database Name:', MONGODB_DB);
    console.log('');
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(MONGODB_DB);
        console.log('Using database:', db.databaseName);
        console.log('');
        
        console.log('=== RAW PRODUCT DATA ===\n');
        const products = await db.collection('products').find({}).toArray();
        console.log(`Total products found: ${products.length}\n`);
        
        products.forEach(p => {
            console.log(`Product: ${p.name} (${p.slug})`);
            console.log(`  category field type: ${typeof p.category}`);
            console.log(`  category value: ${p.category}`);
            console.log(`  category is ObjectId: ${p.category instanceof ObjectId}`);
            console.log(`  categories array: ${JSON.stringify(p.categories || [])}`);
            console.log(`  isActive: ${p.isActive}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkProducts();

