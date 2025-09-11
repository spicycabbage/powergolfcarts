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
  'pink-kush-cake-shatter',
  'sour-diesel-rosin', 
  'temple-ball',
  'wedding-cake-diamonds',
  'twisted-zzz-80mg',
  // Also search for variations
  'pink kush cake shatter',
  'sour diesel rosin',
  'temple ball',
  'wedding cake diamonds',
  'twisted zzz 80mg'
];

async function deepSearch() {
  try {
    await connectToDatabase();
    
    console.log('🔍 DEEP SEARCH for 404 product links...\n');
    
    for (const term of searchTerms) {
      console.log(`Searching for: "${term}"`);
      
      // Search in posts - case insensitive
      const posts = await Post.find({
        content: { $regex: term, $options: 'i' }
      }).select('title slug content').lean();
      
      if (posts.length > 0) {
        console.log(`  ❌ FOUND IN POSTS:`);
        posts.forEach(p => {
          console.log(`    - "${p.title}" (/blog/${p.slug})`);
          // Show the actual content snippet
          const content = p.content || '';
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(term.toLowerCase())) {
              console.log(`      Line ${i+1}: ${line.trim()}`);
            }
          });
        });
      }
      
      // Search in pages
      const pages = await Page.find({
        content: { $regex: term, $options: 'i' }
      }).select('title slug content').lean();
      
      if (pages.length > 0) {
        console.log(`  ❌ FOUND IN PAGES:`);
        pages.forEach(p => {
          console.log(`    - "${p.title}" (/${p.slug})`);
          // Show the actual content snippet
          const content = p.content || '';
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(term.toLowerCase())) {
              console.log(`      Line ${i+1}: ${line.trim()}`);
            }
          });
        });
      }
      
      if (posts.length === 0 && pages.length === 0) {
        console.log(`  ✅ Not found`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

deepSearch();
