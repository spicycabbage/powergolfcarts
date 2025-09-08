import mongoose, { Schema } from 'mongoose'

export interface IOrderItem {
  product: Schema.Types.ObjectId
  variant?: {
    name: string
    value: string
    sku: string
  }
  quantity: number
  price: number
  total: number
}

export interface IPaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer'
  card?: {
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }
  paypal?: {
    email: string
  }
}

export interface IOrder {
  _id?: string
  user: Schema.Types.ObjectId
  items: IOrderItem[]
  invoiceNumber?: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  paymentMethod: IPaymentMethod
  stripePaymentIntentId?: string
  trackingNumber?: string
  trackingCarrier?: string
  tracking?: { carrier: string; number: string; createdAt?: Date }[]
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    name: String,
    value: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be positive']
  }
})

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  type: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    required: true
  },
  card: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  paypal: {
    email: String
  }
})

const AddressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  address1: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String
})

const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  invoiceNumber: {
    type: Number
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  paymentMethod: PaymentMethodSchema,
  stripePaymentIntentId: String,
  trackingNumber: String,
  trackingCarrier: String,
  tracking: [{ carrier: String, number: String, createdAt: { type: Date, default: Date.now } }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
OrderSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true })
OrderSchema.index({ user: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ 'shippingAddress.postalCode': 1 })
OrderSchema.index({ 'billingAddress.postalCode': 1 })

// Virtual for order number (based on creation date and ID)
OrderSchema.virtual('orderNumber').get(function() {
  if (!this.createdAt) return null
  const date = this.createdAt.toISOString().slice(0, 10).replace(/-/g, '')
  const shortId = this._id.toString().slice(-6).toUpperCase()
  return `ORD-${date}-${shortId}`
})

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0)
})

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('tax') || this.isModified('shipping')) {
    // Recalculate subtotal from items
    this.subtotal = this.items.reduce((total, item) => total + item.total, 0)

    // Recalculate total
    this.total = this.subtotal + this.tax + this.shipping
  }
  next()
})

// Static method to get order statistics
OrderSchema.statics.getOrderStats = async function(userId?: string) {
  const match = userId ? { user: userId } : {}

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        ordersByStatus: {
          $push: '$status'
        }
      }
    }
  ])

  if (stats.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      ordersByStatus: {}
    }
  }

  const statusCounts = stats[0].ordersByStatus.reduce((acc: any, status: any) => {
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return {
    ...stats[0],
    ordersByStatus: statusCounts
  }
}

// In dev/hot-reload, ensure single compiled model
if (process.env.NODE_ENV !== 'production' && (mongoose.models as any).Order) {
  delete (mongoose.models as any).Order
}

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order


