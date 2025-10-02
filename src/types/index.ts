// Core product types
export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  // Dual pricing for US and Canadian markets
  priceUSD: number
  priceCAD: number
  originalPriceUSD?: number
  originalPriceCAD?: number
  // Legacy fields for backward compatibility
  price: number
  originalPrice?: number
  images: ProductImage[]
  category: Category
  categories: Category[]
  tags: string[]
  inventory: Inventory
  seo: SEO
  variants?: ProductVariant[]
  reviews: Review[]
  averageRating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  _id: string
  url: string
  alt: string
  width: number
  height: number
  isPrimary: boolean
}

export interface ProductVariant {
  _id: string
  name: string
  value: string
  // Dual pricing for variants
  priceUSD: number
  priceCAD: number
  originalPriceUSD?: number
  originalPriceCAD?: number
  // Legacy fields for backward compatibility
  originalPrice?: number
  price?: number
  inventory: number
  sku: string
}

// Category types
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Category
  children: Category[]
  seo: SEO
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// User types
export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  addresses: Address[]
  orders: Order[]
  wishlist: Product[]
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  _id: string
  type: 'billing' | 'shipping'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// Order types
export interface Order {
  _id: string
  user: User
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  _id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  total: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Cart types
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  bundleDiscount: number
  tax: number
  shipping: number
  total: number
}

// Review types
export interface Review {
  _id: string
  user: User
  product: Product
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// SEO types
export interface SEO {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogImage?: string
  twitterImage?: string
  noIndex?: boolean
}

// Inventory types
export interface Inventory {
  quantity: number
  lowStockThreshold: number
  sku: string
  trackInventory: boolean
}

// Payment types
export interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer'
  card?: {
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }
  paypal?: {
    email: string
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface CheckoutForm {
  email: string
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  notes?: string
}

// Filter and search types
export interface ProductFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  tags?: string[]
  inStock?: boolean
  sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'popular'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  q?: string
  filters?: ProductFilters
  page?: number
  limit?: number
}

// Component props types
export interface ComponentWithChildren {
  children: React.ReactNode
}

export interface ComponentWithClassName {
  className?: string
}


