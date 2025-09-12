# Building a High-Performance Cannabis E-commerce Platform: A Complete Tech Stack Guide

*A comprehensive technical guide to building a modern, scalable cannabis e-commerce platform using Next.js, MongoDB, and modern web technologies.*

## 🏗️ Architecture Overview

This guide documents the complete tech stack used to build **Godbud.cc**, a high-performance cannabis e-commerce platform serving customers across Canada. The platform handles complex product catalogs, real-time inventory management, secure payments, and regulatory compliance requirements.

### Core Architecture Principles

- **Performance First**: Optimized for Core Web Vitals and PageSpeed scores of 95+
- **SEO Optimized**: Server-side rendering with comprehensive schema markup
- **Mobile Responsive**: Mobile-first design with progressive enhancement
- **Scalable**: Built to handle high traffic and large product catalogs
- **Secure**: Industry-standard security practices and compliance features

## 🚀 Frontend Stack

### Next.js 15.0.0 - React Framework
```json
"next": "^15.0.0"
```

**Why Next.js?**
- **App Router**: Modern file-based routing with server components
- **Server-Side Rendering**: Critical for SEO and performance
- **Image Optimization**: Built-in WebP/AVIF conversion and responsive sizing
- **API Routes**: Full-stack capabilities with serverless functions
- **Performance**: Automatic code splitting and optimization

**Key Next.js Features Used:**
```javascript
// next.config.js - Production optimizations
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react'], // Tree shaking
  },
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats
    deviceSizes: [150, 300, 600, 1200, 1920], // Responsive breakpoints
    minimumCacheTTL: 31536000, // 1-year cache for performance
  },
  async redirects() {
    return [
      {
        source: '/products/:slug/',
        destination: '/products/:slug',
        permanent: true, // SEO-friendly URL canonicalization
      }
    ]
  }
}
```

### React 18.3.1 - UI Library
```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```

**Advanced React Patterns Used:**
- **Server Components**: For better performance and SEO
- **Suspense Boundaries**: Graceful loading states
- **Custom Hooks**: Reusable business logic
- **Context API**: Global state management
- **Error Boundaries**: Robust error handling

### TypeScript 5.3.3 - Type Safety
```json
"typescript": "^5.3.3"
```

**TypeScript Implementation:**
```typescript
// Strong typing for e-commerce entities
interface IProduct {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  inventory: {
    quantity: number
    sku: string
    trackInventory: boolean
  }
  variants?: IProductVariant[]
  badges?: ProductBadges
  seo: {
    title?: string
    description?: string
    focusKeyphrase?: string
  }
}

// API response typing
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    totalPages: number
    total: number
  }
}
```

## 🎨 Styling & UI

### Tailwind CSS 3.4.0 - Utility-First CSS
```json
"tailwindcss": "^3.4.0",
"@tailwindcss/typography": "^0.5.16",
"@tailwindcss/forms": "^0.5.10"
```

**Custom Design System:**
```javascript
// tailwind.config.js - Brand colors and animations
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb', // Main brand color
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      }
    }
  }
}
```

**Performance Optimizations:**
- **JIT Compilation**: Only generates used classes
- **Custom Animations**: Smooth micro-interactions
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: CSS custom properties support

### Lucide React 0.344.0 - Icon System
```json
"lucide-react": "^0.344.0"
```

**Optimized Icon Usage:**
```typescript
// Tree-shaken imports for bundle size optimization
import { ShoppingCart, User, Search, Menu } from 'lucide-react'

// Consistent sizing and styling
<ShoppingCart className="w-5 h-5 text-gray-600" />
```

## 🗄️ Backend & Database

### MongoDB 6.3.0 - NoSQL Database
```json
"mongodb": "^6.3.0",
"mongoose": "^8.0.3"
```

**Why MongoDB for E-commerce?**
- **Flexible Schema**: Perfect for varied product attributes
- **Horizontal Scaling**: Handles growth efficiently
- **Rich Queries**: Complex product filtering and search
- **Aggregation Pipeline**: Advanced analytics and reporting

**Schema Design Examples:**
```javascript
// Product Schema with advanced features
const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  inventory: {
    quantity: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    trackInventory: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 }
  },
  variants: [ProductVariantSchema], // Support for product variations
  badges: { // Marketing badges system
    topLeft: { text: String, color: String },
    topRight: { text: String, color: String },
    bottomLeft: { text: String, color: String },
    bottomRight: { text: String, color: String }
  },
  seo: { // Built-in SEO optimization
    title: String,
    description: String,
    focusKeyphrase: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// Performance indexes
ProductSchema.index({ name: 'text', description: 'text' }) // Full-text search
ProductSchema.index({ category: 1, isActive: 1 }) // Category filtering
ProductSchema.index({ price: 1 }) // Price range queries
```

**Advanced MongoDB Features:**
- **Aggregation Pipelines**: Complex analytics queries
- **Text Search**: Full-text product search
- **Geospatial Queries**: Location-based features
- **Change Streams**: Real-time inventory updates

## 🔐 Authentication & Security

### NextAuth.js 4.24.5 - Authentication
```json
"next-auth": "^4.24.5"
```

**Secure Authentication Setup:**
```typescript
// lib/auth/options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Secure password verification with bcrypt
        const user = await User.findOne({ email: credentials?.email })
        if (user && await bcrypt.compare(credentials?.password, user.password)) {
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role // Role-based access control
          }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  }
}
```

### bcryptjs 2.4.3 - Password Hashing
```json
"bcryptjs": "^2.4.3"
```

**Security Best Practices:**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Admin/user permissions
- **CSRF Protection**: Built-in Next.js security
- **Environment Variables**: Secure configuration

## 💳 Payment Processing

### Stripe 14.17.0 - Payment Gateway
```json
"stripe": "^14.17.0",
"@stripe/stripe-js": "^3.0.0"
```

**Secure Payment Implementation:**
```typescript
// Stripe checkout session creation
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cartItems.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.product.name,
        images: [item.product.images[0]]
      },
      unit_amount: Math.round(item.product.price * 100)
    },
    quantity: item.quantity
  })),
  mode: 'payment',
  success_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
  cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
  metadata: {
    orderId: order._id.toString()
  }
})
```

**Payment Features:**
- **Secure Checkout**: PCI-compliant payment processing
- **Multiple Payment Methods**: Cards, digital wallets
- **Subscription Support**: Recurring billing capability
- **Webhook Handling**: Real-time payment status updates
- **Canadian Currency**: Native CAD support

## 🛠️ State Management & Data Fetching

### Zustand 4.5.0 - State Management
```json
"zustand": "^4.5.0"
```

**Lightweight State Management:**
```typescript
// stores/cartStore.ts
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity: number, variant?: ProductVariant) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  total: number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, quantity, variant) => {
    // Complex cart logic with variant support
  },
  get total() {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }
}))
```

### TanStack Query 5.17.15 - Server State
```json
"@tanstack/react-query": "^5.17.15"
```

**Optimized Data Fetching:**
```typescript
// hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true // Smooth pagination
  })
}
```

## 📧 Email & Notifications

### Nodemailer 6.10.1 - Email Service
```json
"nodemailer": "^6.10.1"
```

**Transactional Email System:**
```typescript
// lib/email.ts
export async function sendOrderConfirmation(order: Order) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: order.customer.email,
    subject: `Order Confirmation #${order.invoiceNumber}`,
    html: generateOrderEmailTemplate(order)
  })
}
```

### React Hot Toast 2.4.1 - User Notifications
```json
"react-hot-toast": "^2.4.1"
```

## 🎨 Content Management

### Quill 2.0.3 - Rich Text Editor
```json
"quill": "^2.0.3",
"react-quill": "^2.0.0"
```

**Advanced Content Editor:**
```typescript
// Custom HTML editor with sanitization
const HtmlEditor = ({ value, onChange }) => {
  const sanitizeHtml = (html: string) => {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '') // Remove empty paragraphs
      .trim()
  }

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={(content) => onChange(sanitizeHtml(content))}
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }}
    />
  )
}
```

## 🔍 SEO & Analytics

### Comprehensive SEO Implementation

**Schema Markup:**
```typescript
// components/seo/JsonLd.tsx
export const ProductSchema = ({ product }: { product: Product }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.inventory.sku,
    mpn: product.inventory.sku,
    brand: { '@type': 'Brand', name: 'Godbud.cc' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: product.price,
      availability: product.inventory.quantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Dynamic Sitemap Generation:**
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.godbud.cc'
  
  // Static pages
  const staticUrls = ['/', '/products', '/categories', '/about'].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.7
  }))

  // Dynamic product pages
  const products = await Product.find({ isActive: true }).select('slug updatedAt')
  const productUrls = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }))

  return [...staticUrls, ...productUrls]
}
```

## 🚀 Performance Optimizations

### Image Optimization
```typescript
// components/OptimizedImage.tsx
export function OptimizedImage({ src, alt, ...props }) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc('/placeholder-product.jpg') // Fallback image
    }
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // Base64 blur
    />
  )
}
```

### Caching Strategy
```typescript
// lib/cache.ts
class MemoryCache {
  private cache = new Map()
  private ttl = new Map()

  set(key: string, value: any, ttlMs: number = 300000) { // 5 min default
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + ttlMs)
  }

  get(key: string) {
    if (this.ttl.get(key) < Date.now()) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }
    return this.cache.get(key)
  }
}

export const cache = new MemoryCache()
```

## 🧪 Testing & Quality Assurance

### Jest 30.1.3 - Unit Testing
```json
"jest": "^30.1.3",
"@testing-library/react": "^16.3.0",
"@testing-library/jest-dom": "^6.8.0"
```

**Test Examples:**
```typescript
// __tests__/components/ProductCard.test.tsx
describe('ProductCard', () => {
  it('displays product information correctly', () => {
    const mockProduct = {
      name: 'Test Product',
      price: 29.99,
      images: ['/test-image.jpg']
    }

    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })
})
```

### Cypress 15.0.0 - E2E Testing
```json
"cypress": "^15.0.0"
```

## 📦 Build & Deployment

### Production Build Optimizations
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint"
  }
}
```

**Build Performance:**
- **Bundle Analysis**: Webpack bundle analyzer
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser for JavaScript, cssnano for CSS
- **Compression**: Gzip and Brotli support

### Environment Configuration
```bash
# .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://www.godbud.cc
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

## 🔧 Development Tools & Scripts

### Custom Scripts
```json
{
  "scripts": {
    "seed": "node scripts/seed.js",
    "backup": "node scripts/backup.js",
    "restore": "node scripts/restore.js",
    "optimize:images": "node scripts/optimize-images.js",
    "import:wordpress": "node scripts/import-wordpress.js"
  }
}
```

### Development Workflow
1. **Local Development**: `npm run dev`
2. **Type Checking**: `npm run type-check`
3. **Testing**: `npm run test`
4. **Build**: `npm run build`
5. **Production**: `npm start`

## 📊 Performance Metrics

### Achieved Performance Scores
- **PageSpeed Desktop**: 95-99/100
- **PageSpeed Mobile**: 90-95/100
- **Core Web Vitals**: All green
- **SEO Score**: 100/100
- **Accessibility**: 95+/100

### Key Performance Features
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: WebP/AVIF with responsive sizing
- **Code Splitting**: Minimal JavaScript bundles
- **Caching**: Multi-layer caching strategy
- **CDN Integration**: Global content delivery

## 🚀 Deployment & Infrastructure

### Vercel Deployment
```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🔮 Future Enhancements

### Planned Improvements
- **GraphQL API**: More efficient data fetching
- **Progressive Web App**: Offline functionality
- **Real-time Features**: WebSocket integration
- **AI Recommendations**: Machine learning product suggestions
- **Advanced Analytics**: Custom analytics dashboard
- **Multi-language Support**: Internationalization

## 📚 Key Learnings & Best Practices

### Performance Optimization
1. **Image Optimization**: Use Next.js Image component with proper sizing
2. **Code Splitting**: Implement dynamic imports for large components
3. **Caching**: Multi-layer caching (browser, CDN, server, database)
4. **Bundle Size**: Regular bundle analysis and optimization

### SEO Best Practices
1. **Server-Side Rendering**: Critical for search engine visibility
2. **Schema Markup**: Comprehensive structured data implementation
3. **Meta Tags**: Dynamic, keyword-optimized meta descriptions
4. **URL Structure**: Clean, semantic URLs with proper redirects

### Security Considerations
1. **Authentication**: Secure JWT implementation with NextAuth.js
2. **Data Validation**: Zod schemas for type-safe API validation
3. **Environment Variables**: Secure configuration management
4. **HTTPS**: SSL/TLS encryption for all communications

### Development Workflow
1. **TypeScript**: Strong typing prevents runtime errors
2. **Testing**: Comprehensive unit and integration tests
3. **Code Quality**: ESLint and Prettier for consistent code style
4. **Version Control**: Git with conventional commit messages

## 🤝 Contributing & Community

This tech stack guide represents real-world implementation of a high-performance e-commerce platform. The architecture decisions were made based on:

- **Performance Requirements**: Sub-3-second page loads
- **SEO Needs**: High search engine visibility
- **Scalability**: Ability to handle growth
- **Developer Experience**: Maintainable, type-safe code
- **User Experience**: Fast, responsive, accessible interface

### Resources & Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with ❤️ for the cannabis industry**

*This guide documents the complete tech stack used to build Godbud.cc, a high-performance cannabis e-commerce platform. The implementation focuses on performance, SEO, and user experience while maintaining security and scalability.*

**Live Example**: [https://www.godbud.cc](https://www.godbud.cc)

**Performance**: PageSpeed scores of 95-99/100 consistently achieved

**SEO**: Comprehensive schema markup and optimization strategies implemented

---

*Last updated: December 2024*
