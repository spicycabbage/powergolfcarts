const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from multiple sources
function loadEnvVars() {
  // Try .env.local first, then .env
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
          // Remove quotes if present
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
    console.log('💡 Please make sure you have MONGODB_URI set in your .env file');
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

// List of broken product slugs from SEMrush 404 report
const brokenSlugs = [
  'gold-seal-hash',
  'high-dose-sour-twisted-singles-1200mg',
  'kashmir-ice-hash',
  'la-kush-shatter',
  'premium-pakistani-hash',
  'sour-diesel-rosin',
  'temple-ball',
  'twisted-jelly-bombs-sativa',
  'twisted-zzz-bombs-indica',
  'wedding-cake-diamonds',
  'zkittles'
];

async function cleanup404Products() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    console.log('🔍 Finding broken products...');
    
    // Find all products with these slugs
    const brokenProducts = await Product.find({ 
      slug: { $in: brokenSlugs } 
    }).select('name slug _id');

    console.log(`📋 Found ${brokenProducts.length} broken products:`);
    brokenProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.slug})`);
    });

    if (brokenProducts.length === 0) {
      console.log('✅ No broken products found to delete.');
      return;
    }

    // Ask for confirmation (in a real scenario)
    console.log('\n⚠️  WARNING: This will permanently delete these products!');
    console.log('🗑️  Proceeding with deletion...');

    // Delete the products
    const result = await Product.deleteMany({ 
      slug: { $in: brokenSlugs } 
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} broken products`);
    
    // Also check for any other products that might have similar issues
    console.log('\n🔍 Checking for other potential issues...');
    
    const allProducts = await Product.find({}).select('name slug').lean();
    console.log(`📊 Total products remaining: ${allProducts.length}`);

  } catch (error) {
    console.error('❌ Error cleaning up products:', error);
  }
}

cleanup404Products();
