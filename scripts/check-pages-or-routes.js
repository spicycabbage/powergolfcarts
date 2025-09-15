const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkPagesOrRoutes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('ecommerce');
    
    // Check pages collection
    console.log('\n=== CHECKING PAGES COLLECTION ===');
    const pages = db.collection('pages');
    const pageCount = await pages.countDocuments();
    console.log(`Total pages: ${pageCount}`);
    
    if (pageCount > 0) {
      const categoryPages = await pages.find({
        $or: [
          { slug: { $regex: /categor/i } },
          { title: { $regex: /categor/i } },
          { path: { $regex: /categor/i } }
        ]
      }).toArray();
      
      if (categoryPages.length > 0) {
        console.log('\nPages related to categories:');
        categoryPages.forEach(page => {
          console.log(`- ${page.title || page.name} (${page.slug || page.path})`);
        });
      }
    }
    
    // Check if there's route configuration
    console.log('\n=== CHECKING FOR ROUTE CONFIGURATIONS ===');
    const possibleCollections = ['routes', 'routing', 'urls', 'paths', 'permalinks'];
    
    for (const collName of possibleCollections) {
      if (await db.collection(collName).countDocuments() > 0) {
        console.log(`Found ${collName} collection`);
        const docs = await db.collection(collName).find().limit(5).toArray();
        console.log(`Sample data:`, JSON.stringify(docs[0], null, 2));
      }
    }
    
    // Check navigation document for any path patterns
    console.log('\n=== CHECKING NAVIGATION PATHS AGAIN ===');
    const navigations = db.collection('navigations');
    const nav = await navigations.findOne();
    
    if (nav && nav.primaryNav) {
      // Look for any pattern that might cause "Categories" to appear
      const shattersNav = nav.primaryNav.find(item => 
        item.children && item.children.some(child => child.name === 'Shatters')
      );
      
      if (shattersNav) {
        console.log('\nConcentrates navigation item:');
        console.log(JSON.stringify(shattersNav, null, 2));
      }
    }
    
    // Check for any SEO or metadata that might affect breadcrumbs
    console.log('\n=== CHECKING CATEGORY SEO DATA ===');
    const categories = db.collection('categories');
    const shatters = await categories.findOne({ slug: 'shatters' });
    
    if (shatters && shatters.seo) {
      console.log('\nShatters SEO data:');
      console.log(JSON.stringify(shatters.seo, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkPagesOrRoutes();
