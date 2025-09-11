import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd'
import VariantCard from '@/components/product/VariantCard'
import { serializeProductForClient } from '@/lib/serializers'
import { getSiteConfig } from '@/lib/config'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import { isUsingDataApi, findOne as dataFindOne, findMany as dataFindMany } from '@/lib/dataApi'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import SortSelect from '@/components/SortSelect'

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
    return { title: 'Category Not Found | Godbud.cc' }
  }

  return {
    title: category.seo?.title || `${category.name} | Godbud.cc`,
    description: category.seo?.description || category.description || '',
    keywords: category.seo?.keywords || [],
    alternates: {
      canonical: category.seo?.canonical || `/categories/${lastSlug}`,
    },
  }
}

export default async function CatchAllCategoryPage({ params, searchParams }: CatchAllCategoryPageProps) {
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
  const breadcrumbData = await Category.getBreadcrumbs(category._id.toString());
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
  const allCategoryIds = [category._id.toString()];
  let frontier = [category._id.toString()]
  while (frontier.length > 0) {
    const children = await Category.find({ parent: { $in: frontier } }).select('_id').lean()
    const newIds = children
      .map(c => c._id.toString())
      .filter(id => !allCategoryIds.includes(id))
    if (newIds.length === 0) break
    allCategoryIds.push(...newIds)
    frontier = newIds
  }

  const sortParam = resolvedSearchParams?.sort ? String(resolvedSearchParams.sort) : 'default';
  const sortBy = (() => {
    switch (sortParam) {
      case 'priceAsc': return { price: 1 }
      case 'priceDesc': return { price: -1 }
      case 'newest': return { createdAt: -1 }
      case 'rating': return { averageRating: -1 }
      default: return { createdAt: -1 }
    }
  })()

  const query = {
    isActive: true,
    $or: [
      { category: { $in: allCategoryIds } },
      { categories: { $in: allCategoryIds } },
    ]
  }

  const products = await Product.find(query)
    .select('name slug price originalPrice images averageRating reviewCount inventory variants.name variants.value variants.price variants.originalPrice variants.inventory variants.sku')
    .sort(sortBy)
    .lean()

  const { name, description } = category;

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbsJsonLd crumbs={jsonLdCrumbs} />
      
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {description && (
            <div className="mt-4 prose max-w-none text-gray-600">
              <p>{description}</p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <SortSelect value={sortParam} />
            </div>
            <span className="text-sm text-gray-600">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <VariantCard 
                  key={String(product._id)} 
                  product={serializeProductForClient(product) as any}
                  priority={index < 4}
                />
              ))}
            </div>
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
      </div>
    </div>
  )
}


