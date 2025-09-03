const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce'

// Validate environment variables
if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  console.log('💡 Make sure your .env.local file contains:')
  console.log('   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/ecommerce')
  process.exit(1)
}

const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: '/categories/electronics.jpg',
    seo: {
      title: 'Electronics - Latest Gadgets and Devices',
      description: 'Shop the latest electronics including smartphones, laptops, and gadgets with fast shipping.',
      keywords: ['electronics', 'gadgets', 'smartphones', 'laptops']
    },
    isActive: true
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion apparel for men and women',
    image: '/categories/clothing.jpg',
    seo: {
      title: 'Clothing - Fashion Apparel for Everyone',
      description: 'Discover trendy clothing for men and women with great prices and quality.',
      keywords: ['clothing', 'fashion', 'apparel', 'men', 'women']
    },
    isActive: true
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: '/categories/home-garden.jpg',
    seo: {
      title: 'Home & Garden - Transform Your Space',
      description: 'Find furniture, decor, and garden supplies to create your perfect home.',
      keywords: ['home', 'garden', 'furniture', 'decor', 'garden supplies']
    },
    isActive: true
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment and activewear',
    image: '/categories/sports.jpg',
    seo: {
      title: 'Sports - Equipment and Activewear',
      description: 'Get the best sports equipment and activewear for your favorite activities.',
      keywords: ['sports', 'equipment', 'activewear', 'fitness', 'athletics']
    },
    isActive: true
  }
]

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    shortDescription: 'Premium wireless headphones with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      {
        url: '/products/headphones-1.jpg',
        alt: 'Wireless Bluetooth Headphones - Black',
        width: 800,
        height: 800,
        isPrimary: true
      }
    ],
    category: null, // Will be set after category insertion
    tags: ['electronics', 'audio', 'wireless'],
    inventory: {
      quantity: 50,
      lowStockThreshold: 5,
      sku: 'WH-001',
      trackInventory: true
    },
    seo: {
      title: 'Wireless Bluetooth Headphones - Premium Audio',
      description: 'Experience premium sound quality with our wireless Bluetooth headphones featuring noise cancellation.',
      keywords: ['headphones', 'wireless', 'bluetooth', 'audio', 'noise cancellation']
    },
    variants: [],
    reviews: [],
    averageRating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness watch with heart rate monitoring, GPS, and 7-day battery life.',
    shortDescription: 'Advanced fitness watch with GPS tracking',
    price: 299.99,
    images: [
      {
        url: '/products/fitness-watch-1.jpg',
        alt: 'Smart Fitness Watch - Black',
        width: 800,
        height: 800,
        isPrimary: true
      }
    ],
    category: null, // Will be set after category insertion
    tags: ['electronics', 'fitness', 'smartwatch'],
    inventory: {
      quantity: 30,
      lowStockThreshold: 3,
      sku: 'FW-001',
      trackInventory: true
    },
    seo: {
      title: 'Smart Fitness Watch - Advanced Health Monitoring',
      description: 'Track your fitness with our advanced smartwatch featuring heart rate monitoring and GPS.',
      keywords: ['fitness watch', 'smartwatch', 'health monitoring', 'GPS']
    },
    variants: [],
    reviews: [],
    averageRating: 4.3,
    reviewCount: 95,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-t-shirt',
    description: 'Comfortable organic cotton t-shirt available in multiple colors.',
    shortDescription: 'Comfortable organic cotton t-shirt',
    price: 29.99,
    originalPrice: 39.99,
    images: [
      {
        url: '/products/tshirt-1.jpg',
        alt: 'Organic Cotton T-Shirt - Navy Blue',
        width: 800,
        height: 800,
        isPrimary: true
      }
    ],
    category: null, // Will be set after category insertion
    tags: ['clothing', 'organic', 'cotton'],
    inventory: {
      quantity: 100,
      lowStockThreshold: 10,
      sku: 'TS-001',
      trackInventory: true
    },
    seo: {
      title: 'Organic Cotton T-Shirt - Comfortable and Sustainable',
      description: 'Shop our comfortable organic cotton t-shirts made from sustainable materials.',
      keywords: ['t-shirt', 'organic cotton', 'sustainable', 'comfortable']
    },
    variants: [],
    reviews: [],
    averageRating: 4.7,
    reviewCount: 203,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Modern Desk Lamp',
    slug: 'modern-desk-lamp',
    description: 'Sleek modern desk lamp with adjustable brightness and USB charging port.',
    shortDescription: 'Modern desk lamp with USB charging',
    price: 79.99,
    images: [
      {
        url: '/products/desk-lamp-1.jpg',
        alt: 'Modern Desk Lamp - White',
        width: 800,
        height: 800,
        isPrimary: true
      }
    ],
    category: null, // Will be set after category insertion
    tags: ['home', 'lighting', 'desk'],
    inventory: {
      quantity: 25,
      lowStockThreshold: 5,
      sku: 'DL-001',
      trackInventory: true
    },
    seo: {
      title: 'Modern Desk Lamp - Sleek Lighting Solution',
      description: 'Illuminate your workspace with our modern desk lamp featuring adjustable brightness.',
      keywords: ['desk lamp', 'lighting', 'modern', 'USB charging']
    },
    variants: [],
    reviews: [],
    averageRating: 4.4,
    reviewCount: 67,
    isActive: true,
    isFeatured: true
  }
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(MONGODB_DB)

    console.log('Connected to MongoDB')

    // Clear existing data
    await db.collection('categories').deleteMany({})
    await db.collection('products').deleteMany({})
    await db.collection('users').deleteMany({})

    console.log('Cleared existing data')

    // Insert categories
    const categoryResults = await db.collection('categories').insertMany(sampleCategories)
    console.log(`Inserted ${categoryResults.insertedCount} categories`)

    // Map category names to IDs for products
    const electronicsCategory = await db.collection('categories').findOne({ slug: 'electronics' })
    const clothingCategory = await db.collection('categories').findOne({ slug: 'clothing' })
    const homeGardenCategory = await db.collection('categories').findOne({ slug: 'home-garden' })

    // Update products with category IDs
    sampleProducts[0].category = electronicsCategory._id // Headphones
    sampleProducts[1].category = electronicsCategory._id // Fitness watch
    sampleProducts[2].category = clothingCategory._id // T-shirt
    sampleProducts[3].category = homeGardenCategory._id // Desk lamp

    // Insert products
    const productResults = await db.collection('products').insertMany(sampleProducts)
    console.log(`Inserted ${productResults.insertedCount} products`)

    // Create sample user (for testing)
    const sampleUser = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [],
      orders: [],
      wishlist: [],
      role: 'customer',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection('users').insertOne(sampleUser)
    console.log('Inserted sample user')

    console.log('Database seeding completed successfully!')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

seedDatabase()

