import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { connectToDatabase } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

export const metadata: Metadata = {
  title: 'Our Brands | Power Golf Carts',
  description: 'Explore all products from our premium golf cart brands including Robera, Insanity Golf, Ego Caddy, Tasmania, and Volt Caddy.',
}

async function getBrandsData() {
  await connectToDatabase()
  
  // Get all brand categories in the specified order
  const brandSlugs = ['robera', 'insanity-golf', 'ego-caddy', 'tasmania', 'volt-caddy']
  const categories = await Category.find({ slug: { $in: brandSlugs } }).lean()
  
  // Order brands as per navigation
  const orderedBrands = []
  for (const slug of brandSlugs) {
    const category = categories.find(c => c.slug === slug)
    if (category) {
      orderedBrands.push({
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || null,
      })
    }
  }
  
  return orderedBrands
}

export default async function BrandsPage() {
  const brands = await getBrandsData()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Our Brands</h1>
        </div>
      </section>

      {/* Brand Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No brands available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/categories/${brand.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-video bg-gray-100">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                      {brand.name}
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                    {brand.name}
                  </h2>
                  {brand.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                    View Products →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

