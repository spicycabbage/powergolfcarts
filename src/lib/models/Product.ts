import { Schema, model, models } from 'mongoose'

export interface IProductImage {
  url: string
  alt: string
  width: number
  height: number
  isPrimary: boolean
}

export interface IProductVariant {
  name: string
  value: string
  // Dual pricing for variants
  priceUSD: number
  priceCAD: number
  originalPriceUSD?: number
  originalPriceCAD?: number
  // Legacy fields for backward compatibility
  originalPrice?: number
  price?: number
  inventory: number
  sku?: string
}

export interface IInventory {
  quantity: number
  lowStockThreshold: number
  sku?: string
  trackInventory: boolean
}

export interface ISEO {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogImage?: string
  twitterImage?: string
  noIndex?: boolean
}

export interface IBadge {
  text: string
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray' | 'black'
}

export interface IProductBadges {
  topLeft?: IBadge
  topRight?: IBadge
  bottomLeft?: IBadge
  bottomRight?: IBadge
}

export interface IProduct {
  _id?: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  productType?: 'simple' | 'variable'
  // Dual pricing for US and Canadian markets
  priceUSD: number
  priceCAD: number
  originalPriceUSD?: number
  originalPriceCAD?: number
  // Legacy price field for backward compatibility (will be removed in future)
  price?: number
  originalPrice?: number
  images: IProductImage[]
  category: Schema.Types.ObjectId
  categories: Schema.Types.ObjectId[]
  tags: string[]
  inventory: IInventory
  seo: ISEO
  variants?: IProductVariant[]
  reviews: Schema.Types.ObjectId[]
  averageRating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  badges?: IProductBadges
  createdAt?: Date
  updatedAt?: Date
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
})

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  // Dual pricing for variants
  priceUSD: { type: Number },
  priceCAD: { type: Number },
  originalPriceUSD: { type: Number },
  originalPriceCAD: { type: Number },
  // Legacy fields for backward compatibility
  originalPrice: { type: Number },
  price: { type: Number },
  inventory: { type: Number, required: true, min: 0 },
  sku: { type: String },
})

const InventorySchema = new Schema<IInventory>({
  quantity: { type: Number, required: true, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  sku: { type: String },
  trackInventory: { type: Boolean, default: true },
})

const SEOSchema = new Schema<ISEO>({
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  canonical: { type: String },
  ogImage: { type: String },
  twitterImage: { type: String },
  noIndex: { type: Boolean, default: false },
})

const ProductBadgesSchema = new Schema<IProductBadges>({
  topLeft: {
    text: { type: String },
    color: { 
      type: String,
      enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'black']
    }
  },
  topRight: {
    text: { type: String },
    color: { 
      type: String,
      enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'black']
    }
  },
  bottomLeft: {
    text: { type: String },
    color: { 
      type: String,
      enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'black']
    }
  },
  bottomRight: {
    text: { type: String },
    color: { 
      type: String,
      enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'black']
    }
  }
}, { _id: false })

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
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
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  productType: {
    type: String,
    enum: ['simple', 'variable'],
    default: 'simple'
  },
  // Dual pricing for US and Canadian markets
  priceUSD: {
    type: Number,
    required: [true, 'USD price is required'],
    min: [0, 'USD price must be positive']
  },
  priceCAD: {
    type: Number,
    required: [true, 'CAD price is required'],
    min: [0, 'CAD price must be positive']
  },
  originalPriceUSD: {
    type: Number,
    min: [0, 'Original USD price must be positive']
  },
  originalPriceCAD: {
    type: Number,
    min: [0, 'Original CAD price must be positive']
  },
  // Legacy fields for backward compatibility
  price: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  images: [ProductImageSchema],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Primary category is required']
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{ type: String, trim: true }],
  inventory: InventorySchema,
  seo: SEOSchema,
  variants: [ProductVariantSchema],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  badges: ProductBadgesSchema
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
ProductSchema.index({ name: 'text', description: 'text' })
// slug already has a unique index via the field definition; avoid duplicate index
ProductSchema.index({ category: 1 })
ProductSchema.index({ categories: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ isFeatured: 1 })
ProductSchema.index({ productType: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ averageRating: -1 })
ProductSchema.index({ createdAt: -1 })
// Speed up sort by name (asc/desc)
ProductSchema.index({ name: 1 })

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackInventory) return 'in_stock'
  if (this.inventory.quantity === 0) return 'out_of_stock'
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock'
  return 'in_stock'
})

// Ensure slug is set from name before validation if missing
ProductSchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// In development, clear cached model to ensure schema updates are applied
if (process.env.NODE_ENV === 'development' && (models as any).Product) {
  delete (models as any).Product
}
const Product = models.Product || model<IProduct>('Product', ProductSchema)

export default Product


