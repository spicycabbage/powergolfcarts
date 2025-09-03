const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Import User model
const UserSchema = new mongoose.Schema({
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
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping'],
      required: true
    },
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
    isDefault: Boolean
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
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

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'jackman99@admin.com' })
    if (existingUser) {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Role:', existingUser.role)
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('h@ppyf33t', 12)
      await User.findByIdAndUpdate(existingUser._id, {
        password: hashedPassword,
        role: 'admin'
      })
      console.log('🔄 Updated password and ensured admin role')
      return
    }

    // Hash the password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash('h@ppyf33t', 12)

    // Create admin user
    const adminUser = new User({
      email: 'jackman99@admin.com',
      password: hashedPassword,
      firstName: 'Jack',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      emailVerified: true
    })

    await adminUser.save()

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: jackman99@admin.com')
    console.log('🔑 Password: h@ppyf33t')
    console.log('👤 Role: admin')
    console.log('')
    console.log('🎯 You can now login and access:')
    console.log('   • /admin - Admin dashboard')
    console.log('   • /admin/navigation - Navigation management')
    console.log('   • /admin/categories - Category management')
    console.log('   • /admin/products/import - Product import')

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    
    if (error.code === 11000) {
      console.log('💡 User might already exist. Try logging in with:')
      console.log('   Email: jackman99@admin.com')
      console.log('   Password: h@ppyf33t')
    }
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createAdminUser()


