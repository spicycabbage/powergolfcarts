import mongoose from 'mongoose'

export interface IReview {
  _id: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  customerName: string
  customerEmail?: string
  rating: number // 1-5 stars
  comment: string
  isApproved: boolean
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
  // WordPress import fields
  wpCommentId?: number
  wpPostId?: number
  wpParentId?: number
}

const ReviewSchema = new mongoose.Schema<IReview>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  // WordPress import tracking
  wpCommentId: {
    type: Number
  },
  wpPostId: {
    type: Number,
    sparse: true
  },
  wpParentId: {
    type: Number,
    sparse: true
  }
}, {
  timestamps: true
})

// Indexes for performance
ReviewSchema.index({ product: 1, createdAt: -1 })
ReviewSchema.index({ product: 1, rating: -1 })
ReviewSchema.index({ isApproved: 1 })
ReviewSchema.index({ wpCommentId: 1 }, { unique: true, sparse: true })

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)