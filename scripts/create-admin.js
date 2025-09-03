require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User schema definition (matching the TypeScript model)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  phoneNumber: String,
  dateOfBirth: Date,
  addresses: [{
    type: { type: String, enum: ['billing', 'shipping'], required: true },
    isDefault: { type: Boolean, default: false },
    firstName: String,
    lastName: String,
    company: String,
    streetAddress1: String,
    streetAddress2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phoneNumber: String
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  preferences: {
    newsletter: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true }
  }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function createAdmin() {
  try {
    // Use the MongoDB URI directly since .env.local might not be available
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://MatrixNeo88:iSPaMBmXQMyAoUAh@cluster0.fujdly4.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@yourstore.com' })
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists')
      console.log('Email: admin@yourstore.com')
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin123', 10)
      existingAdmin.password = hashedPassword
      await existingAdmin.save()
      console.log('✅ Password reset to: admin123')
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const adminUser = new User({
        email: 'admin@yourstore.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true
      })

      await adminUser.save()
      console.log('✅ Admin user created successfully!')
      console.log('Email: admin@yourstore.com')
      console.log('Password: admin123')
    }

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()