const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function debugCategoryFormat() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ecommerce');
    const products = db.collection('products');
    const categories = db.collection('categories');
    
    // Get Amnesia Haze product (from your screenshot)
    console.log('\n=== CHECKING AMNESIA HAZE ===');
    const amnesia = await products.findOne({ slug: 'amnesia-haze' });
    
    if (amnesia) {
      console.log('Product found:', amnesia.name);
      console.log('\nPrimary category:');
      console.log('  Type:', amnesia.category ? amnesia.category.constructor.name : 'null');
      console.log('  Value:', amnesia.category);
      
      console.log('\nAdditional categories:');
      console.log('  Type:', Array.isArray(amnesia.categories) ? 'array' : typeof amnesia.categories);
      console.log('  Length:', amnesia.categories ? amnesia.categories.length : 0);
      if (amnesia.categories && amnesia.categories.length > 0) {
        amnesia.categories.forEach((cat, i) => {
          console.log(`  [${i}] Type: ${cat.constructor.name}, Value: ${cat}`);
        });
      }
    }
    
    // Get all categories to compare IDs
    console.log('\n=== ALL CATEGORIES IN DATABASE ===');
    const allCats = await categories.find().toArray();
    allCats.forEach(cat => {
      console.log(`${cat.name}: ${cat._id} (${cat._id.constructor.name})`);
    });
    
    // Check if category IDs match
    if (amnesia && amnesia.category) {
      console.log('\n=== MATCHING PRIMARY CATEGORY ===');
      const primaryCatId = amnesia.category.toString();
      const matchingCat = allCats.find(c => c._id.toString() === primaryCatId);
      console.log('Primary category matches:', matchingCat ? matchingCat.name : 'NOT FOUND');
    }
    
    // Test what happens when we query with different ID formats
    console.log('\n=== TESTING CATEGORY QUERIES ===');
    const sativaId = '68b7e9543313b9323829097f'; // Sativa from earlier output
    
    // Test 1: Find with ObjectId
    const test1 = await categories.findOne({ _id: new ObjectId(sativaId) });
    console.log('Find with ObjectId:', test1 ? test1.name : 'NOT FOUND');
    
    // Test 2: Find with string
    const test2 = await categories.findOne({ _id: sativaId });
    console.log('Find with string:', test2 ? test2.name : 'NOT FOUND');
    
    // Check if categories have string or ObjectId _id
    console.log('\n=== CATEGORY ID TYPES ===');
    const firstCat = await categories.findOne();
    if (firstCat) {
      console.log('First category _id type:', firstCat._id.constructor.name);
      console.log('First category _id:', firstCat._id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugCategoryFormat();
