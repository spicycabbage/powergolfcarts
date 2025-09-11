require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({}, { strict: false });
let Category;
try {
  Category = mongoose.model('Category');
} catch (error) {
  Category = mongoose.model('Category', CategorySchema);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function testCategories() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Testing categories...\n');
    
    // Check categories in database
    const categories = await Category.find({}).select('name slug isActive parent isSystem').lean();
    
    console.log(`📦 Found ${categories.length} categories total\n`);
    
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
      console.log(`  Active: ${cat.isActive}, System: ${cat.isSystem}, Parent: ${cat.parent || 'none'}`);
    });
    
    console.log('\n🔍 Active non-system categories:');
    const activeNonSystem = categories.filter(c => c.isActive && !c.isSystem);
    console.log(`Found ${activeNonSystem.length} active non-system categories`);
    
    activeNonSystem.forEach(cat => {
      console.log(`✅ ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCategories();
