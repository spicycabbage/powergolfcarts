require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

// Import the Product model
const ProductSchema = new mongoose.Schema({
  name: String,
  badges: {
    topLeft: {
      text: String,
      color: String
    },
    topRight: {
      text: String,
      color: String
    },
    bottomLeft: {
      text: String,
      color: String
    },
    bottomRight: {
      text: String,
      color: String
    }
  }
}, { strict: false });

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

async function testBadges() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Testing badge functionality...\n');
    
    // Find a product to test with
    const product = await Product.findOne().lean();
    if (!product) {
      console.log('❌ No products found in database');
      return;
    }
    
    console.log(`📦 Testing with product: "${product.name}"`);
    console.log(`🆔 Product ID: ${product._id}`);
    
    // Check current badges
    console.log('\n📋 Current badges:');
    console.log(JSON.stringify(product.badges, null, 2));
    
    // Try to update with test badges
    const testBadges = {
      topRight: {
        text: 'TEST',
        color: 'red'
      }
    };
    
    console.log('\n🔄 Updating with test badges...');
    const updated = await Product.findByIdAndUpdate(
      product._id,
      { badges: testBadges },
      { new: true, runValidators: true }
    ).lean();
    
    console.log('\n✅ Updated badges:');
    console.log(JSON.stringify(updated.badges, null, 2));
    
    // Verify the update
    const verified = await Product.findById(product._id).select('name badges').lean();
    console.log('\n🔍 Verified badges from database:');
    console.log(JSON.stringify(verified.badges, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testBadges();
