const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function updateNavigationSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get the navigation collection directly
    const db = mongoose.connection.db
    const collection = db.collection('navigations')

    // Find existing navigation document
    const existingNav = await collection.findOne({})
    
    if (existingNav) {
      console.log('📋 Found existing navigation config')
      console.log('Current logo structure:', existingNav.header?.logo)

      // Update the document to include new logo fields
      const updateResult = await collection.updateOne(
        {},
        {
          $set: {
            'header.logo.image': existingNav.header?.logo?.image || '',
            'header.logo.useImage': existingNav.header?.logo?.useImage || false,
            'updatedAt': new Date()
          }
        }
      )

      console.log('✅ Update result:', updateResult)
      
      // Verify the update
      const updatedNav = await collection.findOne({})
      console.log('📋 Updated logo structure:', updatedNav.header?.logo)
      
    } else {
      console.log('ℹ️  No existing navigation config found')
    }

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error updating navigation schema:', error)
    process.exit(1)
  }
}

updateNavigationSchema()



