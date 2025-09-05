import { Schema, model, models, Model, Types } from 'mongoose'

export interface IReview {
  _id?: string
  user: Schema.Types.ObjectId
  product: Schema.Types.ObjectId
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  status?: 'pending' | 'approved' | 'rejected'
  helpful: number
  reported: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface IReviewModel extends Model<IReview> {
  getProductRatingStats(productId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }>
}

const ReviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string[]) {
        return v.length <= 5 // Maximum 5 images per review
      },
      message: 'Cannot upload more than 5 images'
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
ReviewSchema.index({ product: 1, createdAt: -1 })
ReviewSchema.index({ user: 1, product: 1 }, { unique: true }) // One review per user per product
ReviewSchema.index({ rating: 1 })
ReviewSchema.index({ isVerified: 1 })
ReviewSchema.index({ reported: 1 })
ReviewSchema.index({ status: 1 })

// Compound index for efficient queries
ReviewSchema.index({ product: 1, rating: 1, createdAt: -1 })

// Virtual for time ago
ReviewSchema.virtual('timeAgo').get(function() {
  if (!this.createdAt) return null

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
})

// Virtual for rating stars
ReviewSchema.virtual('ratingStars').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating)
})

// Static method to get product reviews with pagination
ReviewSchema.statics.getProductReviews = async function(
  productId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest'
) {
  const pid = typeof productId === 'string' ? new Types.ObjectId(productId) : productId
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
    helpful: { helpful: -1 }
  }

  const reviews = await this.find({ product: pid as any, reported: false, status: 'approved' })
    .populate('user', 'firstName lastName avatar')
    .sort(sortOptions[sortBy])
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()

  const total = await this.countDocuments({ product: pid as any, reported: false, status: 'approved' })

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Static method to get product rating statistics
ReviewSchema.statics.getProductRatingStats = async function(productId: string) {
  const pid = typeof productId === 'string' ? new Types.ObjectId(productId) : productId
  const stats = await this.aggregate([
    { $match: { product: pid as any, reported: false, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ])

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  const distribution = stats[0].ratingDistribution.reduce((acc: any, rating: any) => {
    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
    ratingDistribution: distribution
  }
}

// Instance method to mark as helpful
ReviewSchema.methods.markAsHelpful = function() {
  this.helpful += 1
  return this.save()
}

// Instance method to report review
ReviewSchema.methods.report = function() {
  this.reported = true
  return this.save()
}

// In development, clear cached model to ensure schema updates are applied
if (process.env.NODE_ENV === 'development' && (models as any).Review) {
  delete (models as any).Review
}
const Review = (models.Review as unknown as IReviewModel) || model<IReview, IReviewModel>('Review', ReviewSchema)

export default Review


