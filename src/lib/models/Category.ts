import { Schema, model, models, Model } from 'mongoose'

export interface ICategory {
  _id?: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Schema.Types.ObjectId
  children: Schema.Types.ObjectId[]
  seo: {
    title: string
    description: string
    keywords: string[]
    canonical?: string
    ogImage?: string
    twitterImage?: string
    noIndex?: boolean
  }
  isSystem?: boolean
  isActive: boolean
  featuredOnHomepage?: boolean
  homepageOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

// Interface for the model's statics
export interface ICategoryModel extends Model<ICategory> {
  getOrCreateUncategorized(): Promise<ICategory>;
  getCategoryTree(): Promise<any[]>;
  getBreadcrumbs(categoryId: string): Promise<{ _id: string; name: string; slug: string; }[]>;
}

const SEOSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [{ type: String }],
  canonical: { type: String },
  ogImage: { type: String },
  twitterImage: { type: String },
  noIndex: { type: Boolean, default: false },
})

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  seo: {
    type: SEOSchema,
    required: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredOnHomepage: {
    type: Boolean,
    default: false
  },
  homepageOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance (avoid slug duplicate; field already has unique index)
CategorySchema.index({ parent: 1 })
CategorySchema.index({ isActive: 1 })
CategorySchema.index({ featuredOnHomepage: 1 })
CategorySchema.index({ featuredOnHomepage: 1, homepageOrder: 1 })
CategorySchema.index({ name: 'text', description: 'text' })
CategorySchema.index({ name: 1 })

// Virtual for full path (breadcrumbs)
CategorySchema.virtual('path').get(async function() {
  const path = [this.name]
  let current = this

  while (current.parent) {
    const parent = await (models.Category as unknown as ICategoryModel).findById(current.parent)
    if (parent) {
      path.unshift(parent.name)
      current = parent
    } else {
      break
    }
  }

  return path
})

// Pre-save middleware to generate slug
CategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Ensure an uncategorizable default category exists
CategorySchema.statics.getOrCreateUncategorized = async function() {
  const existing = await this.findOne({ slug: 'uncategorized', parent: null }).lean()
  if (existing) return existing
  const doc = await this.create({
    name: 'Uncategorized',
    slug: 'uncategorized',
    description: 'Default catch-all category',
    parent: null,
    seo: {
      title: 'Uncategorized',
      description: 'Default category',
      keywords: ['uncategorized']
    },
    isSystem: true,
    isActive: true
  })
  return doc.toObject()
}

// Static method to get category tree
CategorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true }).populate('children')
  const buildTree = (categories: any[], parent?: string): any[] => {
    return categories
      .filter(cat => String(cat.parent) === String(parent || ''))
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(categories, cat._id)
      }))
  }
  return buildTree(categories)
}

// Static method to get breadcrumbs - optimized to use single query
CategorySchema.statics.getBreadcrumbs = async function(categoryId: string) {
  const category = await this.findById(categoryId).lean()
  if (!category) return []

  const breadcrumbs = [{
    _id: category._id,
    name: category.name,
    slug: category.slug
  }]

  // If has parent, fetch all potential ancestors in one query
  if (category.parent) {
    const allCategories = await this.find({}).select('_id name slug parent').lean()
    const categoryMap = new Map(allCategories.map(c => [String(c._id), c]))
    
    let currentId = String(category.parent)
    let depth = 0
    while (currentId && depth < 10) { // Max 10 levels to prevent infinite loops
      const parent = categoryMap.get(currentId)
      if (!parent) break
      
      breadcrumbs.unshift({
        _id: parent._id,
        name: parent.name,
        slug: parent.slug
      })
      
      currentId = parent.parent ? String(parent.parent) : ''
      depth++
    }
  }

  return breadcrumbs
}

const Category = (models.Category as unknown as ICategoryModel) || model<ICategory, ICategoryModel>('Category', CategorySchema)

export default Category


