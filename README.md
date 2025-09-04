# E-Commerce Website with Next.js 15

A fully functional, SEO-optimized e-commerce website built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### ✅ Completed
- **Next.js 15 App Router** with TypeScript
- **Database Schema** (MongoDB models for products, categories, users, orders, reviews)
- **API Routes** for products and data fetching
- **Core Components**: Header, Footer, Navigation, Cart, Loading states
- **State Management**: Zustand for cart and authentication
- **Responsive Design** with Tailwind CSS
- **SEO Foundation**: Meta tags, structured data, sitemap setup

### 🚧 In Progress
- Homepage with hero section and dynamic content
- Product listings and detail pages
- Cart and checkout functionality
- User authentication
- Admin dashboard
- Performance optimizations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Supabase account (optional but recommended)
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Database
MONGODB_URI=your_mongodb_uri_here
MONGODB_DB=ecommerce

# NextAuth.js (for authentication)
NEXTAUTH_SECRET=your_random_secret_here_generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

3. **Generate NextAuth Secret:**
```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. **Set up MongoDB:**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env.local
```

5. **Import WordPress products (optional):**
```bash
npm run import:wordpress ./path/to/your/wordpress-export.xml
```

6. **Seed sample data (optional):**
```bash
npm run seed
```

7. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### WordPress Product Import

If you have existing products in WordPress/WooCommerce, you can easily import them:

#### Export from WordPress:
1. Go to **WordPress Admin → Tools → Export**
2. Choose **"Products"** or **"All content"** (products only recommended)
3. Click **"Download Export File"** - you'll get an XML file

#### Run the Import:
```bash
npm run import:wordpress ./wordpress-export.xml
```

#### What Gets Imported:
- ✅ **Product Details**: Name, description, short description
- ✅ **Pricing**: Regular price, sale price, currency
- ✅ **Categories**: Product categories (created automatically)
- ✅ **Images**: Featured images and product galleries
- ✅ **Inventory**: Stock status, quantity, SKU
- ✅ **SEO**: Meta titles, descriptions, keywords
- ✅ **Attributes**: Weight, dimensions, custom fields
- ✅ **Status**: Published/draft, featured products

#### Notes:
- Products with duplicate SKUs or names are skipped
- Categories are created automatically if they don't exist
- Images are referenced by their WordPress attachment IDs
- All WooCommerce meta fields are preserved in `wordpressMeta`

### Database Setup

The application uses MongoDB with the following models:
- **Product**: Products with variants, images, categories
- **Category**: Hierarchical categories with SEO
- **User**: User accounts with addresses and preferences
- **Order**: Order management with payment tracking
- **Review**: Product reviews and ratings

### API Routes

- `GET/POST /api/products` - Product CRUD operations
- `GET/PUT/DELETE /api/products/[id]` - Individual product operations
- `GET/POST /api/categories` - Category management
- `GET/POST /api/orders` - Order processing
- `GET/POST /api/auth` - Authentication endpoints

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── admin/             # Admin dashboard
│   ├── categories/        # Category pages
│   ├── products/          # Product pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── product/          # Product-related components
│   ├── cart/             # Shopping cart components
│   ├── auth/             # Authentication components
│   └── admin/            # Admin components
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # Database connection
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe configuration
│   └── models/           # Database models
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Key Features Implementation

### SEO Optimization
- Dynamic meta tags and Open Graph data
- JSON-LD structured data for products
- Sitemap generation
- Robots.txt configuration
- Canonical URLs

### Performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- ISR (Incremental Static Regeneration)
- Caching strategies

### User Experience
- Responsive design for all devices
- Loading states and error handling
- Progressive enhancement
- Accessibility features (ARIA labels, keyboard navigation)

## Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 🔄 Backup & Restore System

This e-commerce engine is designed to be **reusable across different industries**. Use the backup/restore system to manage different deployments:

### Creating Backups

```bash
# Full database backup
npm run backup full

# Core engine only (no business data)
npm run backup core

# Products and categories only
npm run backup products

# Sample/demo data only
npm run backup sample
```

### Restoring Databases

```bash
# List available backups
npm run restore

# Full restore (complete database)
npm run restore full-backup-2024-01-01T10-00-00.json

# Restore core engine only
npm run restore core-engine-2024-01-01T10-00-00.json core

# Restore specific collections
npm run restore products-2024-01-01T10-00-00.json replace products,categories

# Clean restore (factory reset)
npm run restore --clean
```

## 🏭 Using as a Reusable Engine

### For Different Industries:

1. **Create Core Backup:**
   ```bash
   npm run backup core
   ```

2. **Set up New Industry:**
   ```bash
   # Restore clean core
   npm run restore --clean

   # Import industry-specific products
   npm run import:wordpress ./industry-products.xml

   # Or manually add products through admin
   ```

3. **Backup Industry Data:**
   ```bash
   npm run backup products  # Creates industry-specific backup
   ```

### Industry Examples:

**Fashion Store:**
```bash
npm run import:wordpress ./fashion-products.xml
# Products: Clothing, accessories, sizes, colors
```

**Electronics Store:**
```bash
npm run import:wordpress ./electronics-products.xml
# Products: Gadgets, specs, warranties, tech details
```

**Home Goods:**
```bash
npm run import:wordpress ./home-products.xml
# Products: Furniture, decor, dimensions, materials
```

### Deployment Strategy:

1. **Core Engine Repository** (this codebase)
2. **Industry-Specific Data** (separate backups)
3. **Environment Variables** (per deployment)
4. **Branding Assets** (separate per industry)

### Best Practices:

- **Always backup before major changes**
- **Keep core engine and industry data separate**
- **Use environment variables for industry-specific settings**
- **Test imports on staging before production**
- **Document industry-specific customizations**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
