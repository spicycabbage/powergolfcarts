# Ecommerce Multi-Site Engine

This document explains how to use the core ecommerce engine to build and manage multiple websites efficiently.

## 🏗️ Architecture Overview

### Multi-Tenant Architecture
- **Shared Core**: Common functionality (auth, cart, orders, etc.)
- **Site-Specific**: Configuration, themes, and customizations per site
- **Database Separation**: Each site has its own MongoDB database
- **Deployment Isolation**: Each site can be deployed independently

### Directory Structure
```
ecommerce-engine/
├── src/                    # Core application code
│   ├── app/               # Next.js app router
│   ├── components/        # Shared components
│   ├── lib/               # Core libraries & utilities
│   └── ...
├── sites/                 # Site-specific configurations
│   └── demo-store/
│       ├── config.json    # Site configuration
│       ├── components/    # Custom components
│       ├── styles/        # Custom styles
│       └── .env.local     # Environment variables
├── scripts/               # Automation scripts
└── templates/             # Site templates (future)
```

## 🚀 Quick Start

### 1. Create a New Site
```bash
npm run create-site
```

This will prompt you for:
- Site ID (lowercase, no spaces)
- Site name
- Domain
- Primary color (optional)

### 2. Configure Environment
```bash
cd sites/your-site-id
cp .env.local.template .env.local
# Edit .env.local with your values
```

### 3. Set Up Database
Create a new MongoDB database for your site:
```javascript
// Database name format: ecommerce_{siteId}
// Example: ecommerce_fashion_store
```

### 4. Configure Payment Gateway
Add your Stripe keys to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 5. Deploy Site
```bash
npm run deploy-site
```

## ⚙️ Configuration

### Site Configuration (`config.json`)
```json
{
  "id": "fashion-store",
  "name": "Fashion Store",
  "domain": "fashion-store.com",
  "database": "ecommerce_fashion_store",
  "theme": {
    "primary": "#8B5CF6",
    "secondary": "#64748B",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "text": "#1F2937"
  },
  "features": {
    "blog": false,
    "reviews": true,
    "wishlist": true,
    "multiCurrency": false,
    "multiLanguage": false
  },
  "seo": {
    "title": "Fashion Store - Trendy Clothing",
    "description": "Shop trendy clothing online",
    "keywords": ["fashion", "clothing", "shopping"]
  }
}
```

### Environment Variables
```bash
# Site Identity
NEXT_PUBLIC_SITE_ID=fashion-store
NEXT_PUBLIC_SITE_NAME="Fashion Store"
NEXT_PUBLIC_DOMAIN=fashion-store.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce_fashion_store
MONGODB_DB=ecommerce_fashion_store

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://fashion-store.com

# Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🎨 Customization

### Theme Customization
Sites automatically get theme colors from their `config.json`:

```css
/* Auto-generated from config */
:root {
  --color-primary: #8B5CF6;
  --color-secondary: #64748B;
  --color-accent: #F59E0B;
}
```

### Custom Components
Add site-specific components in `sites/{siteId}/components/`:

```typescript
// sites/fashion-store/components/CustomHero.tsx
import { getSiteConfig } from '../../../src/lib/config'

const CustomHero = () => {
  const config = getSiteConfig()
  return (
    <div style={{ backgroundColor: config.theme.primary }}>
      <h1>Welcome to {config.name}</h1>
    </div>
  )
}
```

### Feature Flags
Control features per site:
```json
{
  "features": {
    "blog": false,
    "reviews": true,
    "wishlist": true,
    "multiCurrency": true,
    "multiLanguage": false
  }
}
```

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm run deploy-site
# Choose 'vercel' when prompted
```

### Netlify
```bash
npm run deploy-site
# Choose 'netlify' when prompted
```

### Heroku
```bash
npm run deploy-site
# Choose 'heroku' when prompted
```

## 🛠️ Development Workflow

### Running Multiple Sites Locally
```bash
# Terminal 1: Site A
NEXT_PUBLIC_SITE_ID=site-a npm run dev

# Terminal 2: Site B
NEXT_PUBLIC_SITE_ID=site-b npm run dev
```

### Testing Site-Specific Features
```bash
# Load specific site config
NEXT_PUBLIC_SITE_ID=demo-store npm run dev
```

## 📊 Database Management

### Per-Site Databases
Each site gets its own MongoDB database:
- Format: `ecommerce_{siteId}`
- Example: `ecommerce_fashion_store`

### Backup & Restore
```bash
# Backup specific site
node scripts/backup.js --site fashion-store

# Restore specific site
node scripts/restore.js --site fashion-store backup-file.json
```

## 🔧 Advanced Configuration

### Custom Routing
Override default routes in `sites/{siteId}/app/`:
```
sites/fashion-store/
└── app/
    ├── products/
    │   └── page.tsx      # Custom products page
    └── about/
        └── page.tsx      # Custom about page
```

### Middleware
Add site-specific middleware:
```typescript
// sites/fashion-store/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Site-specific middleware logic
}
```

### API Extensions
Extend APIs for specific sites:
```typescript
// sites/fashion-store/api/custom-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Custom API logic for fashion-store
}
```

## 📈 Scaling Strategies

### 1. Monorepo Approach (Current)
- ✅ Shared code and dependencies
- ✅ Easy maintenance
- ✅ Consistent architecture
- ❌ Larger repository size
- ❌ All sites deploy together

### 2. Micro-Frontend (Future)
- Separate repositories per site
- Shared core as NPM package
- Independent deployments
- More complex setup

### 3. Multi-Tenant SaaS (Future)
- Single deployment
- Database-level multi-tenancy
- User management per tenant
- Subscription-based

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` files
- Use different keys per environment
- Rotate secrets regularly

### Database Security
- Separate databases per site
- Least privilege access
- Regular backups

### Authentication
- Site-specific user pools
- Custom auth providers per site
- Session isolation

## 📚 Best Practices

### 1. Version Control
```bash
# Use branches for major features
git checkout -b feature/fashion-store-customization

# Tag releases
git tag v1.0.0-fashion-store
```

### 2. Code Organization
- Keep core functionality in `src/`
- Site-specific code in `sites/{siteId}/`
- Shared utilities in `src/lib/`

### 3. Testing
```bash
# Test core functionality
npm run test

# Test site-specific features
npm run test -- --testPathPattern=sites/fashion-store
```

### 4. Monitoring
- Set up analytics per site
- Monitor performance metrics
- Track conversion rates

## 🐛 Troubleshooting

### Common Issues

**Site not loading**
```bash
# Check environment variables
cat sites/your-site/.env.local

# Verify database connection
node scripts/test-db.js your-site-id
```

**Theme not applying**
```bash
# Check config.json syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('sites/your-site/config.json', 'utf8')))"
```

**Database connection failed**
```bash
# Test MongoDB connection
node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review existing site configurations
3. Create an issue with detailed information
4. Include site ID, error messages, and steps to reproduce

## 🎯 Next Steps

1. **Explore the demo site**: `sites/demo-store/`
2. **Create your first site**: `npm run create-site`
3. **Customize components**: Add to `sites/your-site/components/`
4. **Deploy to production**: `npm run deploy-site`

Happy building! 🛒✨



