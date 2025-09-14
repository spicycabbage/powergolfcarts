import { Schema, model, models, Document } from 'mongoose'

export interface ILoyaltyConfig extends Document {
  pointsPerDollar: number
  updatedBy?: Schema.Types.ObjectId
  updatedAt: Date
}

const LoyaltyConfigSchema = new Schema<ILoyaltyConfig>({
  pointsPerDollar: { type: Number, default: 1, min: 0 },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: false, updatedAt: true } })

const LoyaltyConfig = models.LoyaltyConfig || model<ILoyaltyConfig>('LoyaltyConfig', LoyaltyConfigSchema)

export default LoyaltyConfig


