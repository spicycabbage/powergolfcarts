const mongoose = require('mongoose')

async function setupNavigation() {
  try {
    const MONGODB_URI = 'mongodb+srv://MatrixNeo88:iSPaMBmXQMyAoUAh@cluster0.fujdly4.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Navigation schema
    const navigationSchema = new mongoose.Schema({
      header: {
        logo: {
          text: String,
          href: String,
          image: String,
          useImage: Boolean
        },
        banner: {
          text: String,
          isActive: Boolean
        }
      },
      secondaryNav: [{
        name: String,
        href: String,
        isActive: Boolean
      }],
      primaryNav: [{
        name: String,
        href: String,
        isActive: Boolean,
        children: [{
          name: String,
          href: String,
          isActive: Boolean
        }]
      }]
    })

    const Navigation = mongoose.models.Navigation || mongoose.model('Navigation', navigationSchema)

    // Check if navigation exists
    let navConfig = await Navigation.findOne()
    
    if (!navConfig) {
      console.log('❌ No navigation found, creating default...')
      
      // Create navigation with your categories
      navConfig = new Navigation({
        header: {
          logo: {
            text: 'GodBud',
            href: '/',
            image: '',
            useImage: false
          },
          banner: {
            text: 'Premium Cannabis Products - Fast & Discreet Shipping',
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
          {
            name: 'Flowers',
            href: '/categories/flowers',
            isActive: true,
            children: [
              { name: 'Indica', href: '/categories/flowers/indica', isActive: true },
              { name: 'Sativa', href: '/categories/flowers/sativa', isActive: true },
              { name: 'Hybrid', href: '/categories/flowers/hybrid', isActive: true }
            ]
          },
          {
            name: 'Concentrates',
            href: '/categories/concentrates',
            isActive: true,
            children: [
              { name: 'Shatters', href: '/categories/concentrates/shatters', isActive: true },
              { name: 'Diamonds', href: '/categories/concentrates/diamonds', isActive: true }
            ]
          },
          { name: 'Hash', href: '/categories/hash', isActive: true, children: [] },
          { name: 'Edibles', href: '/categories/edibles', isActive: true, children: [] },
          { name: 'CBD', href: '/categories/cbd', isActive: true, children: [] }
        ]
      })

      await navConfig.save()
      console.log('✅ Navigation created successfully!')
    } else {
      console.log('✅ Navigation already exists')
      
      // Update to ensure we have the clean navigation
      navConfig.primaryNav = [
        {
          name: 'Flowers',
          href: '/categories/flowers',
          isActive: true,
          children: [
            { name: 'Indica', href: '/categories/flowers/indica', isActive: true },
            { name: 'Sativa', href: '/categories/flowers/sativa', isActive: true },
            { name: 'Hybrid', href: '/categories/flowers/hybrid', isActive: true }
          ]
        },
        {
          name: 'Concentrates',
          href: '/categories/concentrates',
          isActive: true,
          children: [
            { name: 'Shatters', href: '/categories/concentrates/shatters', isActive: true },
            { name: 'Diamonds', href: '/categories/concentrates/diamonds', isActive: true }
          ]
        },
        { name: 'Hash', href: '/categories/hash', isActive: true, children: [] },
        { name: 'Edibles', href: '/categories/edibles', isActive: true, children: [] },
        { name: 'CBD', href: '/categories/cbd', isActive: true, children: [] }
      ]
      
      await navConfig.save()
      console.log('✅ Navigation updated with clean categories!')
    }

    console.log('\n📝 Navigation structure:')
    navConfig.primaryNav.forEach(item => {
      console.log(`- ${item.name} (${item.href})`)
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          console.log(`  └─ ${child.name} (${child.href})`)
        })
      }
    })

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

setupNavigation()
