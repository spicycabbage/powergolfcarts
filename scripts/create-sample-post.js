// Seed a sample published blog post
try { require('dotenv').config({ path: '.env.local' }) } catch {}
require('dotenv').config()
const mongoose = require('mongoose')

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Define it in .env.local or your environment.')
    process.exit(1)
  }
  const defaultDb = process.env.MONGODB_DB || 'ecommerce'

  let effectiveUri = uri
  const uriMatch = effectiveUri.match(/^mongodb(?:\+srv)?:\/\/[^/]+(\/[^?]+)?(\?.*)?$/)
  if (uriMatch) {
    const hasDbPath = !!(uriMatch[1] && uriMatch[1] !== '/')
    if (!hasDbPath) {
      const query = uriMatch[2] || ''
      const hostPart = effectiveUri.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+).*/, '$1')
      effectiveUri = `${hostPart}/${defaultDb}${query}`
    }
  }

  await mongoose.connect(effectiveUri, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    family: 4,
  })

  const PostSEOSchema = new mongoose.Schema({
    title: String,
    description: String,
    keywords: [String],
    canonical: String,
    ogImage: String,
    twitterImage: String,
    noIndex: { type: Boolean, default: false },
  }, { _id: false })

  const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String },
    tags: [{ type: String }],
    seo: { type: PostSEOSchema },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  }, { timestamps: true })

  const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

  const existing = await Post.findOne({ slug: 'hello-world' })
  const html = `
    <p>Welcome to the blog! This is a sample post created to verify your blog pages are working.</p>
    <p>Edit or delete this post in your database or via the upcoming admin UI.</p>
  `
  let doc
  if (existing) {
    existing.title = 'Hello World'
    existing.excerpt = 'Welcome to the blog! This is a sample post.'
    existing.content = html
    existing.isPublished = true
    if (!existing.publishedAt) existing.publishedAt = new Date()
    existing.tags = Array.from(new Set([...(existing.tags || []), 'general']))
    doc = await existing.save()
  } else {
    doc = await Post.create({
      title: 'Hello World',
      slug: 'hello-world',
      excerpt: 'Welcome to the blog! This is a sample post.',
      content: html,
      tags: ['general'],
      isPublished: true,
      publishedAt: new Date(),
      seo: { title: 'Hello World', description: 'Sample blog post' },
    })
  }

  console.log('Sample post ready:', {
    id: String(doc._id),
    slug: doc.slug,
    isPublished: doc.isPublished,
  })

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})



