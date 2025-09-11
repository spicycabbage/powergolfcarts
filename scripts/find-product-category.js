require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({}, { strict: false });
const CategorySchema = new mongoose.Schema({}, { strict: false });

let Product, Category;
try {
  Product = mongoose.model('Product');
  Category = mongoose.model('Category');
} catch (error) {
  Product = mongoose.model('Product', ProductSchema);
  Category = mongoose.model('Category', CategorySchema);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function findProductCategory() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Finding category for products with badges...\n');
    
    // Find products with badges
    const products = await Product.find({ 
      badges: { $exists: true, $ne: null },
      isActive: true 
    }).lean();
    
    // Get category info separately
    const categoryIds = products.map(p => p.category).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id] = cat;
    });
    
    console.log(`Found ${products.length} active products with badges:\n`);
    
    for (const product of products) {
      const category = categoryMap[product.category];
      console.log(`📦 Product: ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Category: ${category?.name || 'Unknown'} (${category?.slug || 'unknown'})`);
      console.log(`   URL: /categories/${category?.slug || 'unknown'}`);
      console.log(`   Badges:`, Object.keys(product.badges).join(', '));
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

findProductCategory();
