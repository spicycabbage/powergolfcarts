require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({}, { strict: false });
let Product;
try {
  Product = mongoose.model('Product');
} catch (error) {
  Product = mongoose.model('Product', ProductSchema);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function testProductAPI() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Testing product API query (simulating category page)...\n');
    
    // Simulate the same query as the category page
    const products = await Product.find({ isActive: true })
      .select('name slug price originalPrice images averageRating reviewCount inventory variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku badges')
      .limit(5)
      .lean();
    
    console.log(`📦 Found ${products.length} products\n`);
    
    products.forEach(product => {
      console.log(`Product: ${product.name}`);
      console.log(`  Slug: ${product.slug}`);
      console.log(`  Has badges: ${product.badges ? 'YES' : 'NO'}`);
      if (product.badges) {
        console.log(`  Badges:`, JSON.stringify(product.badges, null, 4));
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testProductAPI();
