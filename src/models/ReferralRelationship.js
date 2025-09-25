const mongoose = require('mongoose')

const ReferralRelationshipSchema = new mongoose.Schema({
  // The user who made the referral (permanent referrer)
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user who was referred (permanent referee)
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Referral code used for the initial referral
  referralCode: {
    type: String,
    required: true,
    uppercase: true
  },
  
  // Email of the referred user (for tracking before account creation)
  referredEmail: {
    type: String,
    required: true
  },
  
  // When the relationship was established
  establishedAt: {
    type: Date,
    default: Date.now
  },
  
  // Whether this relationship is active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Total orders processed through this relationship
  totalOrders: {
    type: Number,
    default: 0
  },
  
  // Total loyalty points awarded through this relationship
  totalPointsAwarded: {
    type: Number,
    default: 0
  },
  
  // Total order value processed through this relationship
  totalOrderValue: {
    type: Number,
    default: 0
  },
  
  // Metadata about how the relationship was established
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
})

// Ensure one relationship per referrer-referred pair
ReferralRelationshipSchema.index({ referrer: 1, referred: 1 }, { unique: true })

// Index for efficient lookups
ReferralRelationshipSchema.index({ referred: 1, isActive: 1 })
ReferralRelationshipSchema.index({ referrer: 1, isActive: 1 })
ReferralRelationshipSchema.index({ referredEmail: 1 })

// Method to update relationship stats
ReferralRelationshipSchema.methods.updateStats = async function(orderValue, pointsAwarded) {
  this.totalOrders += 1
  this.totalPointsAwarded += pointsAwarded
  this.totalOrderValue += orderValue
  await this.save()
}

// Static method to find active relationship for a user
ReferralRelationshipSchema.statics.findActiveRelationship = async function(userId) {
  return await this.findOne({
    referred: userId,
    isActive: true
  }).populate('referrer', 'firstName lastName email referralCode loyaltyPoints')
}

// Static method to create or get existing relationship
ReferralRelationshipSchema.statics.createOrGet = async function(referrerId, referredId, referralCode, referredEmail) {
  // Check if relationship already exists
  let relationship = await this.findOne({
    referrer: referrerId,
    referred: referredId
  })
  
  if (relationship) {
    // Reactivate if it was disabled
    if (!relationship.isActive) {
      relationship.isActive = true
      await relationship.save()
    }
    return relationship
  }
  
  // Create new relationship
  return await this.create({
    referrer: referrerId,
    referred: referredId,
    referralCode,
    referredEmail,
    establishedAt: new Date(),
    isActive: true,
    metadata: {
      source: 'referral_link',
      establishedVia: 'order_completion'
    }
  })
}

module.exports = mongoose.models.ReferralRelationship || mongoose.model('ReferralRelationship', ReferralRelationshipSchema)
