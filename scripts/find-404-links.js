require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String
}, { strict: false });

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String
}, { strict: false });

let Post, Page;
try {
  Post = mongoose.model('Post');
  Page = mongoose.model('Page');
} catch (error) {
  Post = mongoose.model('Post', PostSchema);
  Page = mongoose.model('Page', PageSchema);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

const searchTerms = [
  'products/pink-kush-cake-shatter',
  'products/sour-diesel-rosin', 
  'products/temple-ball',
  'products/wedding-cake-diamonds',
  'products/twisted-zzz-80mg'
];

async function findLinks() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Searching for 404 product links in database content...\n');
    
    for (const term of searchTerms) {
      console.log(`Searching for: ${term}`);
      
      // Search in posts
      const posts = await Post.find({
        content: { $regex: term, $options: 'i' }
      }).select('title slug').lean();
      
      if (posts.length > 0) {
        console.log(`  ❌ FOUND IN POSTS:`);
        posts.forEach(p => {
          console.log(`    - "${p.title}" (/blog/${p.slug})`);
        });
      }
      
      // Search in pages
      const pages = await Page.find({
        content: { $regex: term, $options: 'i' }
      }).select('title slug').lean();
      
      if (pages.length > 0) {
        console.log(`  ❌ FOUND IN PAGES:`);
        pages.forEach(p => {
          console.log(`    - "${p.title}" (/${p.slug})`);
        });
      }
      
      if (posts.length === 0 && pages.length === 0) {
        console.log(`  ✅ Not found in database content`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

findLinks();
