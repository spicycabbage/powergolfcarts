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

async function fixBadgeIds() {
  try {
    await connectToDatabase();
    
    console.log('🔧 Fixing badge _id fields...\n');
    
    // Find products with badges
    const products = await Product.find({ badges: { $exists: true, $ne: null } }).lean();
    
    console.log(`📦 Found ${products.length} products with badges\n`);
    
    for (const product of products) {
      console.log(`Fixing badges for: ${product.name}`);
      
      const cleanBadges = {};
      
      // Clean each badge position
      ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].forEach(position => {
        if (product.badges[position]) {
          const badge = product.badges[position];
          // Only keep text and color, remove _id
          cleanBadges[position] = {
            text: badge.text,
            color: badge.color
          };
          console.log(`  ✅ Cleaned ${position}: ${badge.text} (${badge.color})`);
        }
      });
      
      // Update the product with clean badges
      await Product.findByIdAndUpdate(product._id, { badges: cleanBadges });
    }
    
    console.log('\n✅ All badge _id fields have been removed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const verifyProducts = await Product.find({ badges: { $exists: true, $ne: null } }).select('name badges').lean();
    
    verifyProducts.forEach(product => {
      console.log(`\n${product.name}:`);
      console.log(JSON.stringify(product.badges, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixBadgeIds();
