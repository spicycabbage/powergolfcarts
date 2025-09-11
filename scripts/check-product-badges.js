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

async function checkProductBadges() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Checking products for badges...\n');
    
    // Find all products and check their badges
    const products = await Product.find({}).select('name slug badges').lean();
    
    console.log(`📦 Found ${products.length} products total\n`);
    
    let productsWithBadges = 0;
    
    products.forEach(product => {
      if (product.badges && Object.keys(product.badges).length > 0) {
        console.log(`✅ Product "${product.name}" has badges:`);
        console.log(`   Slug: ${product.slug}`);
        console.log(`   Badges:`, JSON.stringify(product.badges, null, 4));
        console.log('');
        productsWithBadges++;
      }
    });
    
    if (productsWithBadges === 0) {
      console.log('❌ No products have badges yet');
      console.log('💡 Try adding a badge to a product in the admin panel');
    } else {
      console.log(`✅ Found ${productsWithBadges} products with badges`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkProductBadges();
