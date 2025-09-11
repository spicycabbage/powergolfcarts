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

// Post schema
const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  tags: [String],
  isPublished: Boolean,
}, { collection: 'posts' });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function cleanupEmptyTag() {
  try {
    await connectToDatabase();
    console.log('🔍 Checking for "coz" tag usage...');
    
    // Find all posts that have the "coz" tag
    const postsWithCozTag = await Post.find({ 
      tags: { $elemMatch: { $regex: '^coz$', $options: 'i' } },
      isPublished: true 
    }).lean();
    
    console.log(`📊 Found ${postsWithCozTag.length} published posts with "coz" tag`);
    
    if (postsWithCozTag.length === 0) {
      console.log('✅ No published posts use the "coz" tag');
      
      // Check if any unpublished posts have this tag
      const unpublishedWithCozTag = await Post.find({ 
        tags: { $elemMatch: { $regex: '^coz$', $options: 'i' } },
        isPublished: false 
      }).lean();
      
      if (unpublishedWithCozTag.length > 0) {
        console.log(`📝 Found ${unpublishedWithCozTag.length} unpublished posts with "coz" tag:`);
        unpublishedWithCozTag.forEach(post => {
          console.log(`   - "${post.title}" (slug: ${post.slug})`);
        });
        
        // Remove "coz" tag from unpublished posts
        const result = await Post.updateMany(
          { 
            tags: { $elemMatch: { $regex: '^coz$', $options: 'i' } },
            isPublished: false 
          },
          { $pull: { tags: { $regex: '^coz$', $options: 'i' } } }
        );
        
        console.log(`🗑️ Removed "coz" tag from ${result.modifiedCount} unpublished posts`);
      }
      
      console.log('🎯 The /blog?tag=coz page should now return 404 or redirect properly');
      console.log('💡 The tag page existed because the tag was in the database, even without published posts');
      
    } else {
      console.log('⚠️ Cannot remove tag - it is being used by published posts:');
      postsWithCozTag.forEach(post => {
        console.log(`   - "${post.title}" (slug: ${post.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up tag:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupEmptyTag();
