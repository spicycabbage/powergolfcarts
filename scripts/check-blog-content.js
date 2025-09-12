require('dotenv').config()
const { MongoClient } = require('mongodb')

async function checkBlogContent() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    return
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db()
    
    console.log('Checking blog post content...\n')
    
    // Get all published blog posts
    const posts = await db.collection('posts').find({ isPublished: true }).toArray()
    
    console.log(`Found ${posts.length} published blog posts:\n`)
    
    posts.forEach((post, index) => {
      const contentLength = post.content ? post.content.length : 0
      const excerptLength = post.excerpt ? post.excerpt.length : 0
      
      // Count words in content (rough estimate)
      const contentWords = post.content ? post.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(word => word.length > 0).length : 0
      const excerptWords = post.excerpt ? post.excerpt.split(/\s+/).filter(word => word.length > 0).length : 0
      
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   URL: https://www.godbud.cc/blog/${post.slug}`)
      console.log(`   Content length: ${contentLength} characters`)
      console.log(`   Content words: ~${contentWords} words`)
      console.log(`   Excerpt length: ${excerptLength} characters`)
      console.log(`   Excerpt words: ~${excerptWords} words`)
      console.log(`   Total estimated words: ~${contentWords + excerptWords} words`)
      console.log(`   Published: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}`)
      
      if (contentLength < 500) {
        console.log(`   ⚠️  WARNING: Very short content!`)
      }
      
      console.log('')
    })
    
    // Check if any posts have very little content
    const shortPosts = posts.filter(post => {
      const contentLength = post.content ? post.content.length : 0
      return contentLength < 1000 // Less than 1000 characters is quite short for a blog
    })
    
    if (shortPosts.length > 0) {
      console.log(`\n🚨 ${shortPosts.length} posts have less than 1000 characters of content:`)
      shortPosts.forEach(post => {
        console.log(`   - ${post.title} (${post.content ? post.content.length : 0} chars)`)
      })
    }
    
  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await client.close()
  }
}

checkBlogContent()
