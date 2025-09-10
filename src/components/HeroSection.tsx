import { OptimizedImage } from '@/components/OptimizedImage'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative text-white overflow-hidden h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/buy-weed-online-canada-godbud.jpg" 
          alt="Buy Weed Online Canada - Godbud"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative h-full flex items-center justify-center sm:justify-start">
        <div className="mx-auto sm:ml-8 md:ml-16 lg:ml-[300px] xl:ml-[450px] sm:mx-0 px-4 sm:px-6 lg:px-8">
          {/* Content */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Discover Amazing
              <span className="block text-primary-200">Products</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-lg mx-auto sm:mx-0">
              Shop the latest trends with fast shipping, great prices, and exceptional customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}


