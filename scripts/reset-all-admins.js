const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
dotenv.config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User schema definition
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function resetAllAdmins() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set. Define it in .env.local or your environment.')
      process.exit(1)
    }
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' })
    console.log(`Found ${adminUsers.length} admin users`)

    // Reset password for each admin
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    for (const admin of adminUsers) {
      admin.password = hashedPassword
      admin.isVerified = true // Ensure they're verified
      await admin.save()
      console.log(`✅ Reset password for: ${admin.email}`)
    }

    console.log('\n📝 All admin accounts have been reset to:')
    console.log('Password: admin123')
    console.log('\nAdmin emails:')
    adminUsers.forEach(admin => {
      console.log(`- ${admin.email}`)
    })

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

resetAllAdmins()
