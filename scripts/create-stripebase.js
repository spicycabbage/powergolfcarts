const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const sourceDir = path.join(__dirname, '..')
const targetDir = path.join(sourceDir, '..', 'stripebase')

console.log('🚀 Creating Stripe E-commerce Base Project...')
console.log(`📁 Source: ${sourceDir}`)
console.log(`📁 Target: ${targetDir}`)

// Check if target exists
if (fs.existsSync(targetDir)) {
  console.error('❌ Target directory already exists. Please remove it first.')
  process.exit(1)
}

// Create target directory
fs.mkdirSync(targetDir, { recursive: true })

// Directories and files to copy
const itemsToCopy = [
  'src',
  'public',
  'scripts',
  '.env.example',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
]

// Directories to exclude from src
const excludeFromSrc = [
  'src/components/pdp/RoberaProEnhanced.tsx',
  'src/components/pdp/EgoCaddyM5Enhanced.tsx',
  'src/components/pdp/TasmaniaG2Enhanced.tsx',
  'src/components/pdp/VoltCaddyEnhanced.tsx',
]

console.log('\n📦 Copying files...')

// Copy items
itemsToCopy.forEach(item => {
  const sourcePath = path.join(sourceDir, item)
  const targetPath = path.join(targetDir, item)
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Skipping ${item} (not found)`)
    return
  }
  
  console.log(`   Copying ${item}...`)
  
  if (fs.statSync(sourcePath).isDirectory()) {
    copyDir(sourcePath, targetPath)
  } else {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.copyFileSync(sourcePath, targetPath)
  }
})

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    // Skip if in exclude list
    const relativePath = path.relative(sourceDir, srcPath).replace(/\\/g, '/')
    if (excludeFromSrc.some(exclude => relativePath === exclude)) {
      continue
    }
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Create README
console.log('\n📝 Creating README...')
const readme = `# Stripe E-commerce Base Project

A production-ready Next.js 15 e-commerce boilerplate with Stripe payment integration.

## Features

### 🛒 E-commerce Core
- Product catalog with categories
- Shopping cart with localStorage persistence
- Product variants (size, color, etc.)
- Product reviews and ratings
- Bundle discounts
- Coupon system
- Featured products

### 💳 Stripe Integration
- Embedded Payment Element (one-page checkout)
- Payment Intent API
- Webhook handling for order status
- Test and live mode support
- Automatic order creation on successful payment

### 👤 Authentication
- NextAuth.js with credentials provider
- User registration and login
- Session management
- Protected routes

### 📦 Order Management
- Order creation with invoice numbers
- Order history for customers
- Admin order management
- Order status tracking
- Shipping address management

### 🎨 UI/UX
- Responsive design (mobile-first)
- Tailwind CSS styling
- Modern component library
- Image optimization
- SEO-friendly

### 🔧 Admin Panel
- Product management (CRUD)
- Category management
- Order management
- Review moderation
- User management
- Blog post management
- Coupon management

### 📧 Email
- Order confirmation emails
- Configurable SMTP settings

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **Payments:** Stripe (Payment Element + API)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Image Handling:** Sharp for optimization
- **Email:** Nodemailer

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account

### 2. Installation

\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/your-store

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourstore.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. Set Up Stripe Webhook

For local development:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
\`\`\`

This will give you a webhook secret starting with \`whsec_\`.

For production:
- Go to Stripe Dashboard → Webhooks
- Add endpoint: \`https://yourdomain.com/api/webhooks/stripe\`
- Select events: \`checkout.session.completed\`, \`payment_intent.succeeded\`

### 5. Create Admin User

\`\`\`bash
node scripts/create-admin.js
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin panel routes
│   │   ├── api/          # API routes
│   │   ├── checkout/     # Checkout flow
│   │   └── products/     # Product pages
│   ├── components/       # React components
│   │   ├── admin/        # Admin components
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout components
│   │   └── layout/       # Layout components
│   ├── lib/              # Utilities and configs
│   │   ├── models/       # Mongoose models
│   │   ├── auth/         # NextAuth config
│   │   └── email/        # Email utilities
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
├── scripts/              # Utility scripts
└── .env.local            # Environment variables
\`\`\`

## Key Files

- \`src/app/api/create-payment-intent/route.ts\` - Stripe Payment Intent creation
- \`src/app/api/webhooks/stripe/route.ts\` - Stripe webhook handler
- \`src/app/api/orders/route.ts\` - Order creation and management
- \`src/components/checkout/StripePaymentForm.tsx\` - Embedded payment form
- \`src/lib/models/Order.ts\` - Order schema with Stripe integration
- \`src/hooks/useCart.ts\` - Shopping cart logic

## Customization

### Branding
1. Update \`src/components/layout/Header.tsx\` with your logo
2. Update \`src/app/layout.tsx\` metadata
3. Replace \`public/logo.png\` with your logo

### Products
1. Import products via \`scripts/import-products.js\`
2. Or create manually in admin panel at \`/admin/products\`

### Styling
- Edit \`tailwind.config.js\` for colors and themes
- Customize components in \`src/components/\`

### Payment Flow
The payment flow is:
1. User adds items to cart
2. User enters shipping/billing info on \`/checkout\`
3. Stripe Payment Element appears
4. User submits payment
5. Payment Intent created
6. On success, order created in database
7. Redirect to \`/checkout/confirmation\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`node scripts/create-admin.js\` - Create admin user
- \`node scripts/backup-full.js\` - Backup database and code

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production
Make sure to set all environment variables in your hosting platform.

## Testing Stripe

Use test cards:
- Success: \`4242 4242 4242 4242\`
- Decline: \`4000 0000 0000 0002\`
- 3D Secure: \`4000 0025 0000 3155\`

Any future expiry, any CVC, any ZIP code.

## Support

This is a base template. Customize as needed for your specific e-commerce needs.

## License

MIT
`

fs.writeFileSync(path.join(targetDir, 'README.md'), readme)

// Update package.json
console.log('📝 Updating package.json...')
const packageJsonPath = path.join(targetDir, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
packageJson.name = 'stripebase'
packageJson.version = '1.0.0'
packageJson.description = 'Next.js 15 E-commerce Base with Stripe Integration'
delete packageJson.author
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

// Create .env.example
console.log('📝 Creating .env.example...')
const envExample = `# Database
MONGODB_URI=mongodb://localhost:27017/your-store-name

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourstore.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Store Name

# Admin (Optional - for seeding)
ADMIN_EMAIL=admin@yourstore.com
ADMIN_PASSWORD=changeme123
`
fs.writeFileSync(path.join(targetDir, '.env.example'), envExample)

// Initialize git
console.log('\n🔧 Initializing git repository...')
try {
  execSync('git init', { cwd: targetDir, stdio: 'inherit' })
  execSync('git add .', { cwd: targetDir, stdio: 'inherit' })
  execSync('git commit -m "Initial commit - Stripe E-commerce Base"', { cwd: targetDir, stdio: 'inherit' })
  console.log('✅ Git repository initialized')
} catch (err) {
  console.log('⚠️  Git initialization skipped')
}

console.log('\n✅ Stripe E-commerce Base project created successfully!')
console.log(`\n📁 Location: ${targetDir}`)
console.log('\n📋 Next steps:')
console.log('   1. cd ../stripebase')
console.log('   2. Copy .env.example to .env.local and fill in your values')
console.log('   3. npm install')
console.log('   4. Set up Stripe webhook (see README.md)')
console.log('   5. node scripts/create-admin.js')
console.log('   6. npm run dev')
console.log('\n📖 See README.md for full documentation')


