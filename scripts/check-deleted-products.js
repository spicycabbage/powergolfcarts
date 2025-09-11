const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from multiple sources
function loadEnvVars() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const [key, ...valueParts] = line.split('=');
        if (key && key.trim() === 'MONGODB_URI') {
          const value = valueParts.join('=').trim();
          return value.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  
  return null;
}

// MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  
  let uri = process.env.MONGODB_URI || loadEnvVars();
  
  if (!uri) {
    console.log('❌ MONGODB_URI not found in environment variables or .env files');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to MongoDB...');
  return mongoose.connect(uri);
}

// Product schema
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Product slugs to check
const productSlugs = [
  'pink-kush-cake-shatter',
  'sour-diesel-rosin',
  'twisted-zzz-80mg',
  'temple-ball',
  'wedding-cake-diamonds'
];

async function checkDeletedProducts() {
  try {
    await connectToDatabase();
    console.log('🔍 Checking if products were deleted...');
    
    const existingProducts = await Product.find({ slug: { $in: productSlugs } }).lean();
    
    if (existingProducts.length === 0) {
      console.log('✅ SUCCESS: All products have been deleted from the database!');
      console.log('🎯 This means your site will no longer generate links to these URLs.');
      console.log('📊 SEMrush should stop reporting these as 404s once it re-crawls your site.');
    } else {
      console.log(`❌ STILL EXISTS: Found ${existingProducts.length} products that need to be deleted:`);
      existingProducts.forEach(product => {
        console.log(`   - ${product.name} (slug: ${product.slug})`);
      });
      console.log('\n💡 Run the cleanup script to delete these products:');
      console.log('   node scripts/cleanup-new-404s.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkDeletedProducts();
