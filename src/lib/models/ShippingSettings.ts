import mongoose, { Document } from 'mongoose'

export interface IShippingMethod {
  id?: string
  name: string
  price: number
  freeThreshold?: number
  sortOrder?: number
  isActive: boolean
  description?: string
}

export interface IShippingSettings extends Document {
  freeShippingThreshold: number
  methods: IShippingMethod[]
  updatedAt: Date
  createdAt: Date
}

const ShippingMethodSchema = new mongoose.Schema<IShippingMethod>({
  id: { type: String, trim: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  freeThreshold: { type: Number, min: 0 },
  sortOrder: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  description: { type: String }
}, { _id: true })

const ShippingSettingsSchema = new mongoose.Schema<IShippingSettings>({
  freeShippingThreshold: { type: Number, required: true, default: 50, min: 0 },
  methods: { type: [ShippingMethodSchema], default: [] },
}, { timestamps: true })

// Ensure singleton config
ShippingSettingsSchema.index({}, { unique: true })

// In dev/hot-reload, ensure single compiled model
if (process.env.NODE_ENV !== 'production' && (mongoose.models as any).ShippingSettings) {
  delete (mongoose.models as any).ShippingSettings
}

const ShippingSettings = mongoose.models.ShippingSettings || mongoose.model<IShippingSettings>('ShippingSettings', ShippingSettingsSchema)

export default ShippingSettings


