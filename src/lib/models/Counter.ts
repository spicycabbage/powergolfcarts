import { Schema, model, models } from 'mongoose'

interface ICounter { _id: string; seq: number }

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 11999 },
}, { versionKey: false })

const Counter = models.Counter || model<ICounter>('Counter', CounterSchema)

export default Counter
