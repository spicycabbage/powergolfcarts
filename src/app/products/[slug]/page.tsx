import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProductImageGallery } from '@/components/ProductImageGallery'
import { ProductActions } from '@/components/ProductActions'
import { ClickableRating } from '@/components/ClickableRating'
import JsonLd from '@/components/seo/JsonLd'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import { isUsingDataApi, findOne as dataFindOne, findMany as dataFindMany } from '@/lib/dataApi'
import { ReviewsTabs } from '@/components/ReviewsTabs'
import LearnMore from '@/components/LearnMore'
import { serializeProductForClient } from '@/lib/serializers'
import { sanitizeHtml } from '@/utils/sanitize'
import VariantCard from '@/components/product/VariantCard'
import RoberaProContent from '@/components/pdp/RoberaProContent'

function normalizeContent(html: string): string {
  try {
    if (!html) return ''
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch && bodyMatch[1]) return bodyMatch[1]
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch && articleMatch[1]) return articleMatch[1]
    let out = html
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<\/?head[^>]*>[\s\S]*?<\/?head>/gi, '')
    // Strip script/style tags for safety and to avoid render issues
    out = out.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    return out
  } catch {
    return html
  }
}

// DB-backed implementation

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  let product: any
  if (isUsingDataApi()) {
    product = await dataFindOne('products', { slug, isActive: true }, {
      name: 1, slug: 1, shortDescription: 1, description: 1, images: 1,
      price: 1, originalPrice: 1, inventory: 1, averageRating: 1, reviewCount: 1,
      category: 1, tags: 1, variants: 1
    })
  } else {
    await connectToDatabase()
    await import('@/lib/models/Category')
    product = await Product.findOne({ slug, isActive: true })
      .select('name slug shortDescription description images price originalPrice inventory averageRating reviewCount category tags variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku')
      .populate('category', 'name slug')
      .lean()
  }

  if (!product) {
    return { title: 'Product Not Found | Power Golf Carts' }
  }

  return {
    title: `${(product as any).name} | Power Golf Carts`,
    description: (product as any).shortDescription || (product as any).description || '',
    alternates: {
      canonical: `/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  let product: any
  if (isUsingDataApi()) {
    product = await dataFindOne('products', { slug, isActive: true }, {
      name: 1, slug: 1, shortDescription: 1, description: 1, images: 1,
      price: 1, originalPrice: 1, inventory: 1, averageRating: 1, reviewCount: 1,
      category: 1, tags: 1, variants: 1
    })
  } else {
    await connectToDatabase()
    await import('@/lib/models/Category')
    const rawProduct = await Product.findOne({ slug, isActive: true })
      .select('name slug shortDescription description images price originalPrice inventory averageRating reviewCount category tags variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku')
      .populate('category', 'name slug')
      .lean()
    
    // Serialize product to remove MongoDB ObjectIds
    product = rawProduct ? serializeProductForClient(rawProduct) : null
  }

  if (!product) {
    notFound()
  }

  // Related products (same primary category)
  let related: any[] = []
  if (isUsingDataApi()) {
    related = await dataFindMany('products', {
      filter: {
        isActive: true,
        slug: { $ne: slug },
        $or: [
          { category: (product as any).category?._id || (product as any).category },
          { categories: (product as any).category?._id || (product as any).category }
        ]
      },
      projection: { 
        name: 1, 
        slug: 1, 
        price: 1, 
        originalPrice: 1, 
        images: 1,
        variants: 1,
        averageRating: 1,
        reviewCount: 1,
        inventory: 1,
        badges: 1
      },
      limit: 8,
    })
  } else {
    const rawRelated = await Product.find({
      isActive: true,
      slug: { $ne: slug },
      $or: [
        { category: (product as any).category?._id || (product as any).category },
        { categories: (product as any).category?._id || (product as any).category }
      ]
    }).select('name slug price originalPrice images variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku averageRating reviewCount inventory badges')
      .limit(8)
      .lean()
    
    // Serialize related products to remove MongoDB ObjectIds
    related = rawRelated.map(serializeProductForClient)
  }

  const categorySlug = (product as any).category?.slug
  const categoryName = (product as any).category?.name
  const categoryPath = categorySlug ? `/categories/${categorySlug}` : '/categories'
  
  // Use environment variables directly to avoid config import issues
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`
  const crumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    ...(categorySlug ? [{ name: categoryName, item: `${baseUrl}${categoryPath}` }] as any : []),
    { name: (product as any).name, item: `${baseUrl}/products/${(product as any).slug}` },
  ]

  const variants: any[] = Array.isArray((product as any).variants) ? (product as any).variants : []
  const totalVariantInventory = variants.reduce((sum: number, v: any) => sum + Number(v?.inventory || 0), 0)
  const isVariable = variants.length > 0

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbsJsonLd crumbs={crumbs} />
      {/* JSON-LD: Enhanced Product Schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${baseUrl}/products/${(product as any).slug}#product`,
          name: (product as any).name,
          description: (product as any).shortDescription || (product as any).description?.slice(0, 160),
          sku: (product as any).inventory?.sku || (product as any).slug,
          mpn: (product as any).inventory?.sku || (product as any).slug,
          category: categoryName,
          itemCondition: 'https://schema.org/NewCondition',
          image: Array.isArray((product as any).images)
            ? (product as any).images.map((img: any) => (typeof img === 'string' ? img : img.url)).slice(0, 5)
            : [],
          brand: { 
            '@type': 'Brand', 
            name: 'Power Golf Carts',
            url: baseUrl
          },
          manufacturer: {
            '@type': 'Organization',
            name: 'Power Golf Carts',
            url: baseUrl
          },
          offers: {
            '@type': 'Offer',
            '@id': `${baseUrl}/products/${(product as any).slug}#offer`,
            priceCurrency: 'CAD',
            price: Number((product as any).price).toFixed(2),
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            availability: (isVariable ? (totalVariantInventory > 0) : ((product as any).inventory?.quantity > 0)) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/products/${(product as any).slug}`,
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'Organization',
              '@id': 'https://www.insanitygolf.com/#organization',
              name: 'Power Golf Carts',
              url: baseUrl
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                currency: 'CAD',
                value: '0'
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 1,
                  maxValue: 2,
                  unitCode: 'DAY'
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 2,
                  maxValue: 5,
                  unitCode: 'DAY'
                }
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'CA'
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'CA',
              returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
              merchantReturnDays: 0,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/FreeReturn',
              additionalProperty: {
                '@type': 'PropertyValue',
                name: 'Store Credit Policy',
                value: 'No returns but store credit for unsatisfied items'
              }
            }
          },
          aggregateRating: (product as any).reviewCount > 0
            ? { 
                '@type': 'AggregateRating', 
                ratingValue: (product as any).averageRating, 
                reviewCount: (product as any).reviewCount,
                bestRating: 5,
                worstRating: 1
              }
            : undefined
        }}
      />
      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href={categorySlug ? `/categories/${categorySlug}` : '/categories'} className="hover:text-primary-600">
              {categoryName || 'Categories'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{(product as any).name}</span>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ProductImageGallery
            images={Array.isArray((product as any).images)
              ? (product as any).images
                  .map((img: any, idx: number) => {
                    if (typeof img === 'string') {
                      return { url: img, alt: (product as any).name, width: 800, height: 800, isPrimary: idx === 0 }
                    }
                    if (img && typeof img === 'object') {
                      return {
                        url: String(img.url || ''),
                        alt: String(img.alt || (product as any).name || ''),
                        width: Number(img.width || 800),
                        height: Number(img.height || 800),
                        isPrimary: Boolean(img.isPrimary),
                      }
                    }
                    return null
                  })
                  .filter(Boolean)
              : []}
            productName={(product as any).name}
          />

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{(product as any).name}</h1>
              
              {/* Rating */}
              <div className="mb-4">
                <ClickableRating 
                  averageRating={(product as any).averageRating || 0}
                  reviewCount={(product as any).reviewCount || 0}
                />
              </div>
              
              {(product as any).shortDescription && (product as any).shortDescription.trim() && (
                <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml((product as any).shortDescription) }} />
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                ${Number((product as any).price ?? (product as any).originalPrice ?? 0).toFixed(2)}
              </span>
              {(product as any).originalPrice && (product as any).originalPrice > (product as any).price && (
                <span className="text-xl text-gray-500 line-through">
                  ${Number((product as any).originalPrice).toFixed(2)}
                </span>
              )}
              {(product as any).originalPrice && (product as any).originalPrice > (product as any).price && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                  {Math.round((((Number((product as any).originalPrice) - Number((product as any).price)) / Number((product as any).originalPrice)) * 100))}% OFF
                </span>
              )}
            </div>

            {/* Stock status intentionally hidden per requirements */}

            {/* Product Actions */}
            <ProductActions product={serializeProductForClient(product as any) as any} />

            {/* Features */}
            {Array.isArray((product as any).features) && (product as any).features.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {(product as any).features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-3"></div>
                      {String(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Description / Reviews Tabs */}
        {(() => {
          const raw = String((product as any).description || '')
          const norm = normalizeContent(raw)
          const html = (norm && norm.trim().length > 0) ? norm : raw
          return (
            <ReviewsTabs 
              productId={String((product as any)._id)} 
              htmlDescription={html}
              productName={(product as any).name}
              productSlug={(product as any).slug}
            />
          )
        })()}

        {/* Rich content section for Robera Pro */}
        {String((product as any).slug) === 'robera-pro' && (
          <RoberaProContent />
        )}

        {/* Related Products */}
        {Array.isArray(related) && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((relatedProduct: any) => (
                <VariantCard
                  key={String(relatedProduct._id)}
                  product={relatedProduct}
                  priority={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Learn more (guides) */}
        {/* Prefer product tags; fallback to category name */}
        <LearnMore tags={(Array.isArray((product as any).tags) && (product as any).tags.length ? (product as any).tags : [categoryName]).filter(Boolean)} />
      </div>
    </div>
  )
}
