import Link from 'next/link'
import Image from 'next/image'

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden cursor-pointer">
        {product.images?.length ? (
          <Image
            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="cursor-pointer">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
      </div>
    </div>
  )
}



