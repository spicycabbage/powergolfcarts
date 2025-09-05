import { Schema, model, models } from 'mongoose'

export interface IPostSEO {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  twitterImage?: string
  noIndex?: boolean
}

export interface IPost {
  _id?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  tags?: string[]
  seo?: IPostSEO
  isPublished: boolean
  publishedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

const PostSEOSchema = new Schema<IPostSEO>({
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  canonical: { type: String },
  ogImage: { type: String },
  twitterImage: { type: String },
  noIndex: { type: Boolean, default: false },
}, { _id: false })

const PostSchema = new Schema<IPost>({
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

// Indexes
PostSchema.index({ slug: 1 }, { unique: true })
PostSchema.index({ title: 'text', content: 'text', excerpt: 'text', tags: 'text' })
PostSchema.index({ isPublished: 1, publishedAt: 1 })

// Generate slug from title if missing
PostSchema.pre('validate', function(next) {
  if ((!this.slug || typeof this.slug !== 'string' || this.slug.trim().length === 0) && this.title) {
    const normalized = String(this.title)
      .toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    this.slug = normalized
  } else if (typeof this.slug === 'string') {
    // Sanitize existing slug without stripping dashes
    this.slug = this.slug
      .toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Dev-time model reset
if (process.env.NODE_ENV === 'development' && (models as any).Post) {
  delete (models as any).Post
}

const Post = models.Post || model<IPost>('Post', PostSchema)
export default Post


