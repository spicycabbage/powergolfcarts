const mongoose = require('mongoose')

const ReferralSettingsSchema = new mongoose.Schema({
  // Loyalty points per dollar spent by referee
  pointsPerDollarSpent: {
    type: Number,
    required: true,
    default: 1, // 1 loyalty point per dollar spent by referee
    min: 0.1,
    max: 10
  },
  
  // Minimum order amount to qualify for referral
  minimumOrderAmount: {
    type: Number,
    default: 0
  },
  
  // Maximum loyalty points per referral
  maxPointsPerReferral: {
    type: Number,
    default: null // No limit
  },
  
  // Referral link expiry (in days)
  linkExpiryDays: {
    type: Number,
    default: 30
  },
  
  // Whether referral system is active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Terms and conditions text
  termsAndConditions: {
    type: String,
    default: 'Referral rewards are awarded as loyalty points after the referred customer completes their first order.'
  }
}, {
  timestamps: true
})

// Ensure only one settings document exists
ReferralSettingsSchema.index({ _id: 1 }, { unique: true })

// Static method to get current settings
ReferralSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne()
  
  if (!settings) {
    // Create default settings
    settings = new this({})
    await settings.save()
  }
  
  return settings
}

module.exports = mongoose.models.ReferralSettings || mongoose.model('ReferralSettings', ReferralSettingsSchema)
