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

// List of 404 URLs to clean up
const urlsToRemove = [
  'https://www.godbud.cc/canadakushies@gmail.com',
  'https://www.godbud.cc/products/high-dose-sour-twisted-singles-1200mg',
  'https://www.godbud.cc/products/la-kush-shatter',
  'https://www.godbud.cc/products/premium-pakistani-hash',
  'https://www.godbud.cc/products/sour-diesel-rosin',
  'https://www.godbud.cc/products/temple-ball',
  'https://www.godbud.cc/products/twisted-jelly-bombs-sativa',
  'https://www.godbud.cc/products/twisted-zzz-bombs-indica',
  'https://www.godbud.cc/products/wedding-cake-diamonds'
];

// Extract product slugs from URLs
const productSlugs = urlsToRemove
  .filter(url => url.includes('/products/'))
  .map(url => url.split('/products/')[1]);

async function cleanup404URLs() {
  try {
    await connectToDatabase();
    console.log('🗑️ Starting cleanup of 404 URLs...');
    
    // Remove products with these slugs from database
    if (productSlugs.length > 0) {
      console.log(`\n🔍 Checking for products with slugs: ${productSlugs.join(', ')}`);
      
      const result = await Product.deleteMany({ slug: { $in: productSlugs } });
      console.log(`✅ Removed ${result.deletedCount} products from database`);
    }
    
    // Note about the email URL
    const emailUrl = urlsToRemove.find(url => url.includes('@'));
    if (emailUrl) {
      console.log(`\n📧 Note: The URL "${emailUrl}" appears to be an email address.`);
      console.log('   This might be from a contact form or mailto link that got indexed.');
      console.log('   No database action needed for this URL.');
    }
    
    console.log('\n📋 Summary of URLs processed:');
    urlsToRemove.forEach(url => {
      if (url.includes('/products/')) {
        console.log(`   ✅ Product URL: ${url}`);
      } else {
        console.log(`   ℹ️  Other URL: ${url}`);
      }
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. These URLs should now return proper 404s');
    console.log('   2. Search engines will eventually remove them from index');
    console.log('   3. Consider adding 301 redirects if you have replacement products');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanup404URLs();
