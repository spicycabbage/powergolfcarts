#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { execSync } = require('child_process')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

class SiteCreator {
  constructor() {
    this.templateDir = path.join(__dirname, '..', 'templates')
    this.sitesDir = path.join(__dirname, '..', 'sites')
  }

  async createSite() {
    console.log('🚀 Ecommerce Site Creator')
    console.log('========================')

    try {
      const siteId = await question('Enter site ID (lowercase, no spaces): ')
      const siteName = await question('Enter site name: ')
      const domain = await question('Enter domain (e.g., mystore.com): ')
      const primaryColor = await question('Enter primary color (hex, default #3B82F6): ') || '#3B82F6'

      const siteConfig = {
        id: siteId,
        name: siteName,
        domain: domain,
        database: `ecommerce_${siteId}`,
        theme: {
          primary: primaryColor,
          secondary: '#64748B',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#1F2937'
        },
        features: {
          blog: false,
          reviews: true,
          wishlist: true,
          multiCurrency: false,
          multiLanguage: false
        },
        seo: {
          title: `${siteName} - Online Store`,
          description: `Shop the best products at ${siteName}`,
          keywords: ['shopping', 'store', 'products', siteId]
        },
        payment: {
          stripe: {
            publishableKey: '',
            secretKey: ''
          }
        },
        email: {
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: '',
              pass: ''
            }
          },
          from: `noreply@${domain}`
        }
      }

      // Create site directory
      const siteDir = path.join(this.sitesDir, siteId)
      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true })
      }

      // Create config file
      const configPath = path.join(siteDir, 'config.json')
      fs.writeFileSync(configPath, JSON.stringify(siteConfig, null, 2))

      // Create environment file template
      const envTemplate = `# ${siteName} Environment Variables
NEXT_PUBLIC_SITE_ID=${siteId}
NEXT_PUBLIC_SITE_NAME="${siteName}"
NEXT_PUBLIC_DOMAIN=${domain}

# Database
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/${siteConfig.database}
MONGODB_DB=${siteConfig.database}

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://${domain}

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@${domain}

# Theme
THEME_PRIMARY=${primaryColor}
THEME_SECONDARY=#64748B
THEME_ACCENT=#F59E0B
THEME_BACKGROUND=#FFFFFF
THEME_TEXT=#1F2937

# Features
FEATURE_BLOG=false
FEATURE_REVIEWS=true
FEATURE_WISHLIST=true
FEATURE_MULTI_CURRENCY=false
FEATURE_MULTI_LANGUAGE=false

# SEO
SEO_TITLE="${siteName} - Online Store"
SEO_DESCRIPTION="Shop the best products at ${siteName}"
SEO_KEYWORDS=shopping,store,products,${siteId}
`

      const envPath = path.join(siteDir, '.env.local.template')
      fs.writeFileSync(envPath, envTemplate)

      // Create custom components directory
      const componentsDir = path.join(siteDir, 'components')
      fs.mkdirSync(componentsDir, { recursive: true })

      // Create custom styles directory
      const stylesDir = path.join(siteDir, 'styles')
      fs.mkdirSync(stylesDir, { recursive: true })

      // Create README for the site
      const readmeContent = `# ${siteName}

## Setup Instructions

1. Copy \`.env.local.template\` to \`.env.local\`
2. Fill in all required environment variables
3. Set up your MongoDB database: \`${siteConfig.database}\`
4. Configure Stripe payment gateway
5. Set up SMTP email service
6. Deploy to your hosting platform

## Environment Variables Required

- \`MONGODB_URI\`: MongoDB connection string
- \`NEXTAUTH_SECRET\`: Random secret for NextAuth.js
- \`NEXTAUTH_URL\`: Your site's URL
- \`STRIPE_SECRET_KEY\`: Stripe secret key
- \`SMTP_USER\` & \`SMTP_PASS\`: Email credentials

## Features Enabled

${Object.entries(siteConfig.features).map(([key, value]) =>
  `- ${key}: ${value ? '✅' : '❌'}`
).join('\n')}

## Customization

- Theme colors can be modified in \`config.json\`
- Custom components can be added to \`components/\`
- Custom styles can be added to \`styles/\`

## Database

This site uses a separate database: \`${siteConfig.database}\`
`

      const readmePath = path.join(siteDir, 'README.md')
      fs.writeFileSync(readmePath, readmeContent)

      console.log('\n✅ Site created successfully!')
      console.log(`📁 Site directory: sites/${siteId}`)
      console.log('\n📋 Next steps:')
      console.log(`1. cd sites/${siteId}`)
      console.log('2. Copy .env.local.template to .env.local')
      console.log('3. Fill in your environment variables')
      console.log('4. Set up your database and payment gateways')
      console.log('5. Run: npm run dev (from project root with SITE_ID=' + siteId + ')')

    } catch (error) {
      console.error('❌ Error creating site:', error.message)
    } finally {
      rl.close()
    }
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new SiteCreator()
  creator.createSite()
}

module.exports = { SiteCreator }


