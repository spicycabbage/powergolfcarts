// Load env from .env.local first (Next.js convention), then fallback to .env
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

  const PageSEOSchema = new mongoose.Schema({
    title: String,
    description: String,
    keywords: [String],
    canonical: String,
    ogImage: String,
    twitterImage: String,
    noIndex: { type: Boolean, default: false },
  }, { _id: false })

  const PageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, default: '' },
    seo: { type: PageSEOSchema },
    isPublished: { type: Boolean, default: false },
  }, { timestamps: true })

  const Page = mongoose.models.Page || mongoose.model('Page', PageSchema)

  const existing = await Page.findOne({ slug: { $in: ['contact', 'contact-us'] } })
  let result
  if (existing) {
    existing.isPublished = true
    if (!existing.content || existing.content.trim() === '') {
      existing.content = 'We\'d love to hear from you. Use the form below.'
    }
    if (existing.slug !== 'contact') {
      existing.slug = 'contact'
    }
    result = await existing.save()
  } else {
    result = await Page.create({
      title: 'Contact',
      slug: 'contact',
      content: '<p>We\'d love to hear from you. Use the form below or email <a href="mailto:info@example.com">info@example.com</a>.</p>',
      seo: {
        title: 'Contact Us',
        description: 'Get in touch with us. We\'re here to help.',
        keywords: ['contact', 'support', 'help'],
      },
      isPublished: true,
    })
  }

  console.log('Contact page ready:', {
    id: result._id?.toString?.(),
    title: result.title,
    slug: result.slug,
    isPublished: result.isPublished,
  })

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})


