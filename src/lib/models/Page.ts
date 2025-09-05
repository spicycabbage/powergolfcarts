import { Schema, model, models } from 'mongoose'

export interface IPageSEO {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  twitterImage?: string
  noIndex?: boolean
}

export interface IPage {
  _id?: string
  title: string
  slug: string
  content: string
  seo?: IPageSEO
  isPublished: boolean
  createdAt?: Date
  updatedAt?: Date
}

const PageSEOSchema = new Schema<IPageSEO>({
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  canonical: { type: String },
  ogImage: { type: String },
  twitterImage: { type: String },
  noIndex: { type: Boolean, default: false },
})

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  content: { type: String, default: '' },
  seo: { type: PageSEOSchema },
  isPublished: { type: Boolean, default: false },
}, {
  timestamps: true,
})

// Indexes
PageSchema.index({ slug: 1 }, { unique: true })
PageSchema.index({ title: 'text', content: 'text' })
PageSchema.index({ isPublished: 1 })

// Generate slug from title if missing
PageSchema.pre('validate', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Dev-time model reset
if (process.env.NODE_ENV === 'development' && (models as any).Page) {
  delete (models as any).Page
}

const Page = models.Page || model<IPage>('Page', PageSchema)
export default Page



