import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BundleClient } from '@/components/bundles/BundleClient'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  originalPrice: number
  images: string[]
  inventory: number
  sku: string
}

interface Bundle {
  name: string
  description: string
  requiredQuantity: number
  discountPercentage: number
  skuFilter: string
}

interface BundlePageProps {
  params: Promise<{ slug: string }>
}

async function getBundleData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bundles/${slug}/products`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching bundle data:', error)
    return null
  }
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getBundleData(slug)
  
  if (!data || !data.bundle) {
    return {
      title: 'Bundle Not Found',
    }
  }
  
  return {
    title: `${data.bundle.name} | Bundle Deals`,
    description: data.bundle.description,
    alternates: {
      canonical: `/bundles/${slug}`,
    },
  }
}

export default async function BundlePage({ params }: BundlePageProps) {
  const { slug } = await params
  const data = await getBundleData(slug)
  
  if (!data || !data.bundle || !data.products) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.bundle.name}</h1>
          <p className="text-xl text-gray-600">{data.bundle.description}</p>
        </div>
      </div>

      {/* Bundle Products - Client Component */}
      <BundleClient
        products={data.products}
        bundle={data.bundle}
      />
    </div>
  )
}
