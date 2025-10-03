const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function checkDatabase() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(MONGODB_DB);
        
        console.log('=== CATEGORIES ===');
        const categories = await db.collection('categories').find({}).toArray();
        categories.forEach(cat => {
            console.log(`- ${cat.name} (${cat.slug}) ID: ${cat._id}`);
        });
        
        console.log('\n=== PRODUCTS ===');
        const products = await db.collection('products').find({}).toArray();
        products.forEach(p => {
            console.log(`- ${p.name} (${p.slug})`);
            console.log(`  Category ID: ${p.category}`);
            console.log(`  Categories: ${JSON.stringify(p.categories || [])}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkDatabase();

