import mongoose from 'mongoose'

interface INavigationItem {
  name: string
  href: string
  categoryId?: string
  isActive: boolean
  children?: INavigationItem[]
}

interface INavigationConfig {
  header: {
    logo: {
      text: string
      href: string
      image?: string
      useImage: boolean
    }
    banner: {
      text: string
      isActive: boolean
    }
  }
  secondaryNav: INavigationItem[]
  primaryNav: INavigationItem[]
  updatedAt: Date
}

const NavigationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  href: { type: String, required: true },
  categoryId: { type: String },
  isActive: { type: Boolean, default: true },
  children: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false })

const NavigationConfigSchema = new mongoose.Schema<INavigationConfig>({
  header: {
    logo: {
      text: { type: String, required: true, default: 'E-Commerce' },
      href: { type: String, required: true, default: '/' },
      image: { type: String, default: '' },
      useImage: { type: Boolean, default: false }
    },
    banner: {
      text: { type: String, default: 'Free shipping on orders over $50! Use code FREESHIP' },
      isActive: { type: Boolean, default: true }
    }
  },
  secondaryNav: [NavigationItemSchema],
  primaryNav: [NavigationItemSchema],
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Ensure only one navigation config exists
NavigationConfigSchema.index({}, { unique: true })

const Navigation = mongoose.models.Navigation || mongoose.model<INavigationConfig>('Navigation', NavigationConfigSchema)

export default Navigation
export type { INavigationConfig, INavigationItem }
