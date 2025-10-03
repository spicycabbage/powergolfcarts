const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

console.log('URI:', MONGODB_URI);
console.log('DB Name:', MONGODB_DB);

async function checkDatabase() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('\n✅ Connected to MongoDB');
        
        const db = client.db(MONGODB_DB);
        console.log('Using database:', db.databaseName);
        
        console.log('\n=== CATEGORIES ===');
        const categories = await db.collection('categories').find({}).toArray();
        console.log(`Found ${categories.length} categories:`);
        categories.forEach(cat => {
            console.log(`- ${cat.name} (${cat.slug}) ID: ${cat._id}`);
        });
        
        console.log('\n=== PRODUCTS ===');
        const products = await db.collection('products').find({}).toArray();
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- ${p.name} (${p.slug})`);
            console.log(`  Category ID: ${p.category}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkDatabase();

