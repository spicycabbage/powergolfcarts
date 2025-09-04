require('dotenv').config()
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

async function cleanupAdmins() {
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

    // Delete all admin users except the one we want to keep
    const keepEmail = 'jackman99@admin.com'
    const newPassword = 'h@ppyf33t'
    let keptAdmin = null

    for (const admin of adminUsers) {
      if (admin.email === keepEmail) {
        keptAdmin = admin
        console.log(`✅ Keeping admin: ${admin.email}`)
      } else {
        await User.deleteOne({ _id: admin._id })
        console.log(`❌ Deleted admin: ${admin.email}`)
      }
    }

    // If no admin with keepEmail exists, create one
    if (!keptAdmin) {
      console.log(`\n📝 Creating new admin: ${keepEmail}`)
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      keptAdmin = new User({
        email: keepEmail,
        password: hashedPassword,
        firstName: 'Jack',
        lastName: 'Admin',
        role: 'admin',
        isVerified: true
      })
      await keptAdmin.save()
    } else {
      // Reset password for the kept admin
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      keptAdmin.password = hashedPassword
      keptAdmin.isVerified = true
      await keptAdmin.save()
    }

    console.log('\n✅ Admin cleanup complete!')
    console.log('📝 Admin credentials:')
    console.log(`Email: ${keepEmail}`)
    console.log(`Password: ${newPassword}`)

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanupAdmins()
