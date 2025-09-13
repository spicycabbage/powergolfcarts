import { Schema, model, models } from 'mongoose'

export interface ICoupon {
  _id?: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number // percentage (0-100) or fixed amount
  minimumOrderAmount?: number
  maximumDiscountAmount?: number // for percentage coupons
  usageLimit?: number // total usage limit
  usageCount: number // current usage count
  userUsageLimit?: number // per-user usage limit
  validFrom: Date
  validUntil: Date
  isActive: boolean
  applicableCategories?: Schema.Types.ObjectId[] // if empty, applies to all
  excludedCategories?: Schema.Types.ObjectId[]
  applicableProducts?: Schema.Types.ObjectId[] // if empty, applies to all
  excludedProducts?: Schema.Types.ObjectId[]
  createdBy: Schema.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Coupon code can only contain letters and numbers']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value must be positive'],
    validate: {
      validator: function(this: ICoupon, value: number) {
        if (this.type === 'percentage') {
          return value >= 0 && value <= 100
        }
        return value >= 0
      },
      message: 'Percentage value must be between 0 and 100'
    }
  },
  minimumOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount must be positive'],
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount must be positive']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    min: [1, 'User usage limit must be at least 1'],
    default: 1
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
    validate: {
      validator: function(this: ICoupon, value: Date) {
        return value > this.validFrom
      },
      message: 'Valid until date must be after valid from date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
CouponSchema.index({ code: 1 }, { unique: true })
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 })
CouponSchema.index({ createdBy: 1 })

// Virtual for checking if coupon is currently valid
CouponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date()
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (!this.usageLimit || this.usageCount < this.usageLimit)
})

// Method to calculate discount for a given cart
CouponSchema.methods.calculateDiscount = function(cartSubtotal: number, applicableAmount: number) {
  if (!this.isCurrentlyValid) return 0
  if (cartSubtotal < (this.minimumOrderAmount || 0)) return 0
  
  let discount = 0
  
  if (this.type === 'percentage') {
    discount = (applicableAmount * this.value) / 100
    if (this.maximumDiscountAmount) {
      discount = Math.min(discount, this.maximumDiscountAmount)
    }
  } else {
    discount = Math.min(this.value, applicableAmount)
  }
  
  return Math.round(discount * 100) / 100 // Round to 2 decimal places
}

// Static method to validate coupon for a user and cart
CouponSchema.statics.validateCoupon = async function(
  code: string, 
  userId: string, 
  cartItems: any[]
) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  }).populate('applicableCategories excludedCategories applicableProducts excludedProducts')
  
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' }
  }
  
  const now = new Date()
  if (coupon.validFrom > now) {
    return { valid: false, error: 'Coupon is not yet active' }
  }
  
  if (coupon.validUntil < now) {
    return { valid: false, error: 'Coupon has expired' }
  }
  
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' }
  }
  
  // Check user usage limit
  if (coupon.userUsageLimit && userId) {
    const Order = models.Order
    if (Order) {
      const userUsageCount = await Order.countDocuments({
        user: userId,
        'coupon.code': coupon.code,
        status: { $ne: 'cancelled' }
      })
      
      if (userUsageCount >= coupon.userUsageLimit) {
        return { valid: false, error: 'You have reached the usage limit for this coupon' }
      }
    }
  }
  
  return { valid: true, coupon }
}

const Coupon = models.Coupon || model<ICoupon>('Coupon', CouponSchema)

export default Coupon
