import { Schema, model, models, Document } from 'mongoose'

export interface IAddress {
  type: 'billing' | 'shipping'
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
  isDefault: boolean
}

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  avatar?: string
  addresses: IAddress[]
  orders: Schema.Types.ObjectId[]
  wishlist: Schema.Types.ObjectId[]
  role: 'customer' | 'admin'
  isActive: boolean
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['billing', 'shipping'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States'
  },
  phone: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
})

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String
  },
  addresses: [AddressSchema],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

const User = models.User || model<IUser>('User', UserSchema)

export default User