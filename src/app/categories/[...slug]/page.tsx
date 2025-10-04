import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import { LazyProductGrid } from '@/components/LazyProductGrid'
import { getSiteConfig } from '@/lib/config'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import { isUsingDataApi, findOne as dataFindOne, findMany as dataFindMany } from '@/lib/dataApi'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import SortSelect from '@/components/SortSelect'
import { CategoryInfoSection } from '@/components/CategoryInfoSection'
import { serializeArrayForClient } from '@/lib/utils/serialize'

export const dynamic = 'force-dynamic'

interface CatchAllCategoryPageProps {
  params: Promise<{ slug: string[] }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CatchAllCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const segments = Array.isArray(slug) ? slug : [slug]
  const lastSlug = segments[segments.length - 1]
  
  let category: any
  if (isUsingDataApi()) {
    category = await dataFindOne('categories', { slug: lastSlug })
  } else {
    await connectToDatabase()
    category = await Category.findOne({ slug: lastSlug }).lean()
  }

  if (!category) {
    return { title: 'Category Not Found | Power Golf Carts' }
  }

  return {
    title: category.seo?.title || `${category.name} | Power Golf Carts`,
    description: category.seo?.description || category.description || '',
    keywords: category.seo?.keywords || [],
    alternates: {
      canonical: category.seo?.canonical || `/categories/${lastSlug}`,
    },
  }
}

export default async function CatchAllCategoryPage({ params, searchParams }: CatchAllCategoryPageProps) {
  try {
    const resolvedParams = await params
    const resolvedSearchParams = searchParams ? await searchParams : {}
    const segments = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug]
    const lastSlug = segments[segments.length - 1]

    let category: any
    if (isUsingDataApi()) {
      category = await dataFindOne('categories', { slug: lastSlug })
    } else {
      await connectToDatabase()
      category = await Category.findOne({ slug: lastSlug }).lean()
    }

    if (!category) {
      return notFound()
    }

  // --- Breadcrumb Data Fetching and Formatting ---
  const breadcrumbData = await Category.getBreadcrumbs(String(category._id));
  const breadcrumbItems = breadcrumbData.map((segment) => ({
    name: segment.name,
    href: `/categories/${segment.slug}`,
  }));
  
  const cfg = getSiteConfig();
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`;
  const jsonLdCrumbs = breadcrumbItems.map(item => ({
    name: item.name,
    item: `${baseUrl}${item.href}`
  }));

  // --- Product Fetching Logic ---
  // Fetch all children in ONE query instead of a loop
  const allChildren = await Category.find({ parent: category._id }).select('_id').lean()
  const allCategoryIds: string[] = [
    String(category._id),
    ...allChildren.map(c => String(c._id))
  ]

  const sortParam = resolvedSearchParams?.sort ? String(resolvedSearchParams.sort) : 'priceDesc';
  const sortBy = (() => {
    switch (sortParam) {
      case 'priceAsc': return { price: 1 }
      case 'priceDesc': return { price: -1 }
      case 'newest': return { createdAt: -1 }
      case 'rating': return { averageRating: -1 }
      default: return { price: -1 }
    }
  })()

  const query = {
    isActive: true,
    $or: [
      { category: { $in: allCategoryIds } },
      { categories: { $in: allCategoryIds } },
    ]
  }

  const rawProducts = await Product.find(query)
    .select('name slug price originalPrice images averageRating reviewCount inventory variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku badges')
    .sort(sortBy as any)
    .limit(100) // Limit to prevent mobile timeouts
    .lean()
    .maxTimeMS(10000) // 10 second timeout

  // Serialize products to remove MongoDB ObjectIds and toJSON methods
  const products = serializeArrayForClient(rawProducts)

  const { name, description } = category;

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbsJsonLd crumbs={jsonLdCrumbs} />
      
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-1">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {description && (
            <div className="mt-0.5 prose max-w-none text-gray-600">
              <p>{description}</p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <SortSelect value={sortParam} />
            </div>
            <span className="text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} total
            </span>
          </div>

          {products.length > 0 ? (
            <LazyProductGrid 
              products={products}
              initialCount={8}
              loadIncrement={8}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingBag className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">There are no products in this category yet.</p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>

        {/* Category Information Section - Below Products */}
        {products.length > 0 && (
          <CategoryInfoSection 
            categoryName={category?.name || 'Products'} 
            categorySlug={category?.slug || ''} 
            productCount={products.length}
          />
        )}
      </div>
    </div>
  ) 
  } catch (error) {
    console.error('Category page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're having trouble loading this category page.</p>
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }
}


