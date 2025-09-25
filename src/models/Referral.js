const mongoose = require('mongoose')

const ReferralSchema = new mongoose.Schema({
  // The user who made the referral
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user who was referred (optional - they might not have an account yet)
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Referral code for the referrer (not unique - one person can refer multiple people)
  referralCode: {
    type: String,
    required: true,
    uppercase: true
  },
  
  // Email of the person who used the referral (for tracking before account creation)
  referredEmail: {
    type: String,
    default: null
  },
  
  // Order that triggered the referral reward
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Order details
  orderTotal: {
    type: Number,
    required: true
  },
  
  // Loyalty points awarded (1 point per dollar spent)
  loyaltyPointsAwarded: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Points per dollar rate at time of award
  pointsPerDollarSpent: {
    type: Number,
    required: true,
    default: 1
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'awarded', 'cancelled'],
    default: 'pending'
  },
  
  // When the referral was used (order placed)
  referralUsedAt: {
    type: Date,
    default: Date.now
  },
  
  // When the commission was awarded
  awardedAt: {
    type: Date,
    default: null
  },
  
  // Additional tracking info
  metadata: {
    // Product that was shared (if from PDP)
    sharedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    
    // Source of the referral
    source: {
      type: String,
      enum: ['product_share', 'direct_link', 'social_media', 'permanent_relationship', 'permanent_relationship_manual_fix', 'manual_fix'],
      default: 'product_share'
    },
    
    // User agent and IP for fraud prevention
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
})

// Indexes for performance
ReferralSchema.index({ referrer: 1, createdAt: -1 })
ReferralSchema.index({ referralCode: 1 })
ReferralSchema.index({ referredEmail: 1 })
ReferralSchema.index({ status: 1 })
ReferralSchema.index({ referralUsedAt: -1 })

// Virtual for commission display
ReferralSchema.virtual('commissionDisplay').get(function() {
  return `$${this.commissionAmount.toFixed(2)} (${this.commissionRate}%)`
})

// Method to award loyalty points
ReferralSchema.methods.awardLoyaltyPoints = async function() {
  if (this.status === 'awarded') return false
  
  try {
    // Find the referrer user
    const User = mongoose.model('User')
    const referrer = await User.findById(this.referrer)
    
    if (!referrer) throw new Error('Referrer not found')
    
    // Award loyalty points
    referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + this.loyaltyPointsAwarded
    await referrer.save()
    
    // Update referral status
    this.status = 'awarded'
    this.awardedAt = new Date()
    await this.save()
    
    return true
  } catch (error) {
    console.error('Error awarding loyalty points:', error)
    return false
  }
}

// Static method to generate unique referral code
ReferralSchema.statics.generateReferralCode = async function(userId) {
  const User = mongoose.model('User')
  const user = await User.findById(userId)
  
  if (!user) throw new Error('User not found')
  
  // Generate code based on user's name/email + random string
  const baseCode = (user.firstName || user.email.split('@')[0]).substring(0, 4).toUpperCase()
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  let referralCode = baseCode + randomSuffix
  let attempts = 0
  
  // Ensure uniqueness
  while (attempts < 10) {
    const existing = await this.findOne({ referralCode })
    if (!existing) break
    
    // Generate new code
    const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    referralCode = baseCode + newSuffix
    attempts++
  }
  
  if (attempts >= 10) {
    // Fallback to completely random code
    referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }
  
  return referralCode
}

module.exports = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema)
