import { Schema, model, models, Document } from 'mongoose'

export interface ILoyaltyReward extends Document {
  name: string
  value: number
  pointsCost: number
  validDays?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const LoyaltyRewardSchema = new Schema<ILoyaltyReward>({
  name: { type: String, required: true, trim: true },
  value: { type: Number, required: true, min: 0 },
  pointsCost: { type: Number, required: true, min: 1 },
  validDays: { type: Number, min: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const LoyaltyReward = models.LoyaltyReward || model<ILoyaltyReward>('LoyaltyReward', LoyaltyRewardSchema)

export default LoyaltyReward


