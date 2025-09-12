import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IEmailSubscriber extends Document {
  email: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  source: 'newsletter' | 'footer' | 'popup' | 'checkout' | 'manual'
  tags: string[]
  firstName?: string
  lastName?: string
  preferences: {
    productUpdates: boolean
    promotions: boolean
    blogPosts: boolean
    weeklyDigest: boolean
  }
  lastEmailSent?: Date
  emailsSent: number
  clicks: number
  opens: number
  unsubscribeToken: string
}

const EmailSubscriberSchema = new Schema<IEmailSubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['newsletter', 'footer', 'popup', 'checkout', 'manual'],
    default: 'newsletter'
  },
  tags: [{
    type: String,
    trim: true
  }],
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  preferences: {
    productUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    blogPosts: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true }
  },
  lastEmailSent: {
    type: Date
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  opens: {
    type: Number,
    default: 0
  },
  unsubscribeToken: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
EmailSubscriberSchema.index({ email: 1 })
EmailSubscriberSchema.index({ isActive: 1 })
EmailSubscriberSchema.index({ source: 1 })
EmailSubscriberSchema.index({ subscribedAt: -1 })
EmailSubscriberSchema.index({ unsubscribeToken: 1 })

// Generate unsubscribe token before saving
EmailSubscriberSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    try {
      const crypto = require('crypto')
      this.unsubscribeToken = crypto.randomBytes(32).toString('hex')
    } catch (error) {
      console.error('Error generating unsubscribe token:', error)
      // Fallback to a simple random string
      this.unsubscribeToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    }
  }
  next()
})

// Virtual for full name
EmailSubscriberSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  return this.firstName || this.lastName || this.email.split('@')[0]
})

const EmailSubscriber: Model<IEmailSubscriber> = mongoose.models.EmailSubscriber || mongoose.model<IEmailSubscriber>('EmailSubscriber', EmailSubscriberSchema)

export default EmailSubscriber
