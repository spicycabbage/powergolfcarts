import mongoose, { Schema } from 'mongoose'

export interface IPaymentSettings {
  etransfer: {
    enabled: boolean
    note?: string
  }
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>({
  etransfer: {
    enabled: { type: Boolean, default: true },
    note: { type: String, default: 'Auto-deposit enabled. No security question required.' }
  }
}, { timestamps: true })

// In dev/hot-reload, ensure single compiled model
if (process.env.NODE_ENV !== 'production' && (mongoose.models as any).PaymentSettings) {
  delete (mongoose.models as any).PaymentSettings
}

const PaymentSettings = mongoose.models.PaymentSettings || mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema)

export default PaymentSettings


