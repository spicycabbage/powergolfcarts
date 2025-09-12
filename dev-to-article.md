# Building a High-Performance Cannabis E-commerce Platform: A Next.js 14 Case Study

When I set out to build [Godbud.cc](https://www.godbud.cc), a cannabis e-commerce platform for the Canadian market, I faced unique challenges that most e-commerce developers don't encounter. Beyond the typical performance and SEO requirements, I needed to navigate complex compliance regulations, implement sophisticated product filtering for cannabis strains, and create a user experience that builds trust in a heavily regulated industry.

After 18 months of development and optimization, the platform now consistently achieves 95-99 PageSpeed scores, handles thousands of products across multiple categories, and provides a seamless shopping experience for cannabis consumers across Canada.

Here's how I built it and the lessons learned along the way.

## The Technical Challenge

Cannabis e-commerce presents unique technical requirements:

- **Complex product variations**: Each strain has dozens of attributes (THC/CBD levels, terpene profiles, effects, medical benefits)
- **Regulatory compliance**: Age verification, regional restrictions, legal disclaimers
- **Trust building**: Users need confidence in product quality and legal compliance
- **Performance**: Fast loading times are crucial for conversion in this competitive market
- **SEO optimization**: Competing with established players requires technical SEO excellence

## Architecture Decisions

### Why Next.js 14 with App Router?

I chose Next.js 14 for several key reasons:

```javascript
// next.config.js - Optimized for cannabis e-commerce
const nextConfig = {
  images: {
    domains: ['www.godbud.cc'],
    minimumCacheTTL: 31536000, // 1 year cache for product images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  async redirects() {
    return [
      {
        source: '/products/:slug/',
        destination: '/products/:slug',
        permanent: true,
      },
    ]
  },
}
```

**Server-Side Rendering** was crucial for SEO. Cannabis-related content needs to be immediately crawlable by search engines, and the App Router's flexibility allowed me to implement both SSR and SSG where appropriate.

**Image Optimization** became critical when dealing with high-quality product photos. The platform at [Godbud.cc](https://www.godbud.cc) serves thousands of product images, and Next.js's built-in optimization reduced load times by 60%.

### MongoDB for Flexible Product Catalogs

Cannabis products have incredibly diverse attributes. A traditional SQL schema would have been nightmare to maintain:

```javascript
// Product schema - MongoDB flexibility was essential
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
  // Cannabis-specific fields
  strainType: { type: String, enum: ['indica', 'sativa', 'hybrid'] },
  thcContent: { min: Number, max: Number },
  cbdContent: { min: Number, max: Number },
  terpenes: [String],
  effects: [String],
  medicalBenefits: [String],
  
  // E-commerce fields
  variants: [{
    size: String,
    price: Number,
    stock: Number,
    sku: String
  }],
  
  // SEO fields
  seoTitle: String,
  metaDescription: String,
  focusKeyphrase: String,
  
  // Badge system for promotions
  badges: [{
    text: String,
    color: { type: String, enum: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black'] },
    position: { type: String, enum: ['TL', 'TR', 'BL', 'BR'] }
  }]
});
```

This flexibility allowed the platform to handle everything from flower products with detailed cannabinoid profiles to edibles with dosage information and concentrates with extraction methods.

## Performance Optimization Strategies

### 1. Strategic Component Architecture

I implemented a hybrid approach using both Server and Client Components:

```jsx
// Server Component for SEO-critical content
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  
  return (
    <div>
      <ProductHero product={product} />
      <ProductDetails product={product} />
      <ProductReviews productId={product._id} />
      <RelatedProducts category={product.category} />
    </div>
  );
}

// Client Component for interactive features
'use client';
export default function ProductVariantSelector({ variants }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  
  return (
    <div className="space-y-4">
      {variants.map(variant => (
        <button
          key={variant._id}
          onClick={() => setSelectedVariant(variant)}
          className={`p-3 border rounded-lg transition-all ${
            selectedVariant._id === variant._id 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {variant.size} - ${variant.price}
        </button>
      ))}
    </div>
  );
}
```

### 2. Advanced Search Implementation

The search functionality needed to handle complex cannabis terminology while remaining fast:

```jsx
// Real-time search with debouncing
'use client';
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await response.json();
        setResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search strains, edibles, concentrates..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
      />
      
      {query && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map(product => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category?.name}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. SEO and Structured Data

Cannabis e-commerce requires extensive structured data for search engines:

```javascript
// Comprehensive product schema
export function generateProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://www.godbud.cc/products/${product.slug}#product`,
    name: product.name,
    description: product.description,
    image: product.images?.map(img => `https://www.godbud.cc${img}`) || [],
    brand: {
      '@type': 'Brand',
      name: 'Godbud.cc'
    },
    category: product.category?.name,
    sku: product.sku,
    mpn: product.sku, // Required for Google
    gtin: product.gtin || product.sku,
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      lowPrice: Math.min(...product.variants.map(v => v.price)),
      highPrice: Math.max(...product.variants.map(v => v.price)),
      offerCount: product.variants.length,
      availability: product.variants.some(v => v.stock > 0) 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Godbud.cc',
        url: 'https://www.godbud.cc'
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'CA'
      }
    },
    aggregateRating: product.reviews?.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviews.length
    } : undefined
  };
}
```

## Performance Results

The optimizations paid off significantly. The platform consistently achieves:

- **PageSpeed Desktop**: 95-99
- **PageSpeed Mobile**: 90-95
- **Core Web Vitals**: All green
- **SEO Score**: 100
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s

### Key Performance Techniques:

1. **Image Optimization**: Next.js Image component with proper `sizes` attributes
2. **Code Splitting**: Dynamic imports for non-critical components
3. **Database Optimization**: MongoDB aggregation pipelines and proper indexing
4. **Caching Strategy**: Static generation for product pages, ISR for dynamic content
5. **CSS Optimization**: Tailwind CSS with purging and critical CSS inlining

## Unique Cannabis E-commerce Features

### 1. Flexible Badge System

Cannabis products often have promotions, quality indicators, or special attributes:

```jsx
// Dynamic badge system
export default function ProductBadges({ badges }) {
  const getBadgeClasses = (color, position) => {
    const colorClasses = {
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-black',
      purple: 'bg-purple-500 text-white',
      pink: 'bg-pink-500 text-white',
      orange: 'bg-orange-500 text-white',
      black: 'bg-black text-white'
    };
    
    const positionClasses = {
      TL: 'top-2 left-2',
      TR: 'top-2 right-2',
      BL: 'bottom-2 left-2',
      BR: 'bottom-2 right-2'
    };
    
    return `absolute ${positionClasses[position]} ${colorClasses[color]} px-2 py-1 text-xs font-bold rounded z-10`;
  };
  
  return (
    <>
      {badges?.map((badge, index) => (
        <div
          key={index}
          className={getBadgeClasses(badge.color, badge.position)}
        >
          {badge.text}
        </div>
      ))}
    </>
  );
}
```

### 2. Advanced Product Filtering

Cannabis consumers need sophisticated filtering options:

```jsx
// Multi-dimensional product filtering
export default function ProductFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    category: '',
    strainType: '',
    thcRange: [0, 30],
    cbdRange: [0, 25],
    priceRange: [0, 500],
    effects: [],
    inStock: false
  });
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };
  
  return (
    <div className="space-y-6">
      {/* Strain Type Filter */}
      <div>
        <h3 className="font-semibold mb-2">Strain Type</h3>
        <div className="space-y-2">
          {['indica', 'sativa', 'hybrid'].map(type => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="strainType"
                value={type}
                checked={filters.strainType === type}
                onChange={(e) => handleFilterChange('strainType', e.target.value)}
                className="mr-2"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* THC Range Filter */}
      <div>
        <h3 className="font-semibold mb-2">THC Content (%)</h3>
        <input
          type="range"
          min="0"
          max="30"
          value={filters.thcRange[1]}
          onChange={(e) => handleFilterChange('thcRange', [0, parseInt(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span>{filters.thcRange[1]}%</span>
        </div>
      </div>
      
      {/* Effects Filter */}
      <div>
        <h3 className="font-semibold mb-2">Effects</h3>
        <div className="space-y-2">
          {['relaxed', 'euphoric', 'creative', 'focused', 'sleepy', 'energetic'].map(effect => (
            <label key={effect} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.effects.includes(effect)}
                onChange={(e) => {
                  const newEffects = e.target.checked
                    ? [...filters.effects, effect]
                    : filters.effects.filter(f => f !== effect);
                  handleFilterChange('effects', newEffects);
                }}
                className="mr-2"
              />
              <span className="capitalize">{effect}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Lessons Learned

### 1. Compliance is Code

Cannabis e-commerce requires baking compliance into every component. Age verification, regional restrictions, and legal disclaimers can't be afterthoughts—they need to be architectural decisions.

### 2. Trust Through Transparency

Users need extensive product information. The detailed product pages on [Godbud.cc](https://www.godbud.cc) include lab results, growing information, and detailed effects because trust is everything in this industry.

### 3. Performance Impacts Conversion

In cannabis e-commerce, users often research extensively before purchasing. Fast page loads and smooth interactions directly impact conversion rates. Our 95+ PageSpeed scores translate to measurably higher conversion rates.

### 4. SEO is Highly Competitive

Cannabis SEO requires technical excellence. Structured data, perfect Core Web Vitals, and comprehensive content are table stakes for ranking in this competitive space.

## Admin Tools and Management

Building the platform required extensive admin tooling:

```jsx
// Admin dashboard with real-time analytics
export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    const response = await fetch('/api/admin/analytics');
    const data = await response.json();
    setAnalytics(data);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
        <p className="text-3xl font-bold">${analytics?.totalSales?.toLocaleString()}</p>
        <p className="text-blue-100 text-sm">
          {analytics?.salesGrowth > 0 ? '+' : ''}{analytics?.salesGrowth}% from last month
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Orders</h3>
        <p className="text-3xl font-bold">{analytics?.totalOrders}</p>
        <p className="text-green-100 text-sm">
          {analytics?.ordersGrowth > 0 ? '+' : ''}{analytics?.ordersGrowth}% from last month
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Products</h3>
        <p className="text-3xl font-bold">{analytics?.totalProducts}</p>
        <p className="text-purple-100 text-sm">{analytics?.activeProducts} active</p>
      </div>
      
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">Users</h3>
        <p className="text-3xl font-bold">{analytics?.totalUsers}</p>
        <p className="text-orange-100 text-sm">{analytics?.newUsers} new this month</p>
      </div>
    </div>
  );
}
```

## Conclusion

Building this cannabis e-commerce platform taught me that the industry requires a unique blend of technical excellence, regulatory compliance, and user trust-building. The platform now serves thousands of customers across Canada with consistently high performance scores and a seamless user experience.

The key takeaways for any developer building in regulated industries:

1. **Architecture matters**: Plan for compliance from day one
2. **Performance is conversion**: Every millisecond counts in competitive markets
3. **Trust through transparency**: Detailed product information builds confidence
4. **SEO requires technical excellence**: Structured data and Core Web Vitals are essential
5. **Admin tools are crucial**: Complex products need sophisticated management interfaces

You can explore the final result at [www.godbud.cc](https://www.godbud.cc) to see these techniques in action. The platform demonstrates how modern web technologies can create exceptional user experiences even in highly regulated industries.

---

*Have questions about building e-commerce platforms with Next.js? Drop them in the comments below! I'd love to discuss specific implementation details or help with similar challenges you might be facing.*

## Tags
#nextjs #ecommerce #mongodb #react #webdev #seo #performance #cannabis #tailwindcss #javascript
