const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const productSchema = new mongoose.Schema({
  name: String,
  variants: [{
    sku: String,
    name: String,
    price: Number,
    originalPrice: Number,
    inventory: Number
  }],
  inventory: {
    quantity: Number,
    sku: String,
    trackInventory: Boolean
  },
  isActive: Boolean
});

const Product = mongoose.model('Product', productSchema);

async function checkInventoryAfter() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('📊 Current inventory levels (after order):');
    console.log('='.repeat(50));
    
    // Check the same hash products
    const hashProducts = await Product.find({ 
      isActive: true,
      'variants.sku': { $regex: /HAS28G/i }
    }).limit(3).select('name variants');
    
    hashProducts.forEach(product => {
      console.log(`\n📦 ${product.name}:`);
      const has28gVariant = product.variants.find(v => v.sku && v.sku.match(/HAS28G/i));
      if (has28gVariant) {
        console.log(`   28g Variant (${has28gVariant.sku}): ${has28gVariant.inventory} units`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkInventoryAfter();
