import mongoose from 'mongoose'

const BundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  // Bundle configuration
  requiredQuantity: {
    type: Number,
    required: true,
    default: 4
  },
  discountPercentage: {
    type: Number,
    required: true,
    default: 15
  },
  // Product filtering criteria
  skuFilter: {
    type: String,
    required: true,
    trim: true
  },
  // Category information
  category: {
    type: String,
    required: true,
    enum: ['flower', 'hash', 'shatter']
  },
  size: {
    type: String,
    required: true,
    enum: ['28g', '7g']
  },
  // Display settings
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // SEO fields
  seoTitle: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    default: ''
  },
  focusKeyphrase: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Indexes
BundleSchema.index({ slug: 1 })
BundleSchema.index({ isActive: 1, sortOrder: 1 })
BundleSchema.index({ category: 1, size: 1 })

export default mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema)

