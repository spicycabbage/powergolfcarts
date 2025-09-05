const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Navigation schema
const NavigationSchema = new mongoose.Schema({
  header: {
    logo: {
      text: { type: String, required: true, default: 'E-Commerce' },
      href: { type: String, required: true, default: '/' }
    },
    banner: {
      text: { type: String, default: 'Free shipping on orders over $50! Use code FREESHIP' },
      isActive: { type: Boolean, default: true }
    }
  },
  secondaryNav: [{
    name: { type: String, required: true },
    href: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }],
  primaryNav: [{
    name: { type: String, required: true },
    href: { type: String, required: true },
    categoryId: { type: String },
    isActive: { type: Boolean, default: true },
    children: [{ type: mongoose.Schema.Types.Mixed }]
  }],
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

async function initializeNavigation() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Navigation = mongoose.model('Navigation', NavigationSchema)

    // Check if navigation config already exists
    const existingConfig = await Navigation.findOne()
    if (existingConfig) {
      console.log('ℹ️  Navigation configuration already exists')
      await mongoose.disconnect()
      return
    }

    // Create default navigation configuration
    const defaultConfig = new Navigation({
      header: {
        logo: {
          text: 'E-Commerce',
          href: '/'
        },
        banner: {
          text: 'Free shipping on orders over $50! Use code FREESHIP',
          isActive: true
        }
      },
      secondaryNav: [
        { name: 'About Us', href: '/about', isActive: true },
        { name: 'FAQ', href: '/faq', isActive: true },
        { name: 'Blog', href: '/blog', isActive: true },
        { name: 'Contact Us', href: '/contact', isActive: true }
      ],
      primaryNav: [
        { name: 'Shop All', href: '/categories', isActive: true },
        { name: 'Electronics', href: '/categories/electronics', isActive: true },
        { name: 'Clothing', href: '/categories/clothing', isActive: true },
        { name: 'Home & Garden', href: '/categories/home-garden', isActive: true },
        { name: 'Sports', href: '/categories/sports', isActive: true }
      ]
    })

    await defaultConfig.save()
    console.log('✅ Default navigation configuration created successfully!')
    
    console.log('📋 Configuration includes:')
    console.log('   • Header logo and banner settings')
    console.log('   • Secondary navigation (About, FAQ, Blog, Contact)')
    console.log('   • Primary navigation (Shop categories)')
    
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error initializing navigation:', error)
    process.exit(1)
  }
}

initializeNavigation()




