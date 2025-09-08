// Load env (prefer .env.local)
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })
dotenv.config()
const mongoose = require('mongoose')

// Minimal User schema (matches collection shape)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--new' || a === '-n') out.newEmail = args[++i]
    else if (a === '--old' || a === '-o') out.oldEmail = args[++i]
  }
  if (!out.newEmail) out.newEmail = process.env.ADMIN_EMAIL
  return out
}

async function run() {
  const { newEmail, oldEmail } = parseArgs()
  if (!newEmail) {
    console.error('❌ Missing --new <email> or ADMIN_EMAIL in env')
    process.exit(1)
  }
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Define it in .env.local or your environment.')
    process.exit(1)
  }

  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  const cleanNew = String(newEmail).trim().toLowerCase()
  const cleanOld = oldEmail ? String(oldEmail).trim().toLowerCase() : undefined

  // Ensure new email not taken
  const existing = await User.findOne({ email: cleanNew })
  if (existing) {
    console.error(`❌ Email already in use: ${cleanNew}`)
    process.exit(1)
  }

  // Find an admin to update
  const query = { role: 'admin', ...(cleanOld ? { email: cleanOld } : {}) }
  const admin = await User.findOne(query)
  if (!admin) {
    console.error('❌ Admin user not found. Try providing --old <current-admin-email>.')
    process.exit(1)
  }

  const prev = admin.email
  admin.email = cleanNew
  await admin.save()
  console.log(`✅ Updated admin email: ${prev} → ${cleanNew}`)

  await mongoose.disconnect()
  console.log('🔌 Disconnected from MongoDB')
}

run().catch(err => { console.error('❌ Error:', err); process.exit(1) })


