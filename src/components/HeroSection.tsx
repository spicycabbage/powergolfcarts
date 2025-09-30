import { OptimizedImage } from '@/components/OptimizedImage'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative text-white overflow-hidden h-[350px] md:h-[500px]">
      {/* Background Images - Responsive */}
      <div className="absolute inset-0">
        {/* Mobile Image */}
        <Image
          src="/god-mobile.webp"
          alt="Buy Weed Online Canada - Godbud"
          fill
          className="block md:hidden object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Desktop Image */}
        <Image
          src="/buy-weed-online-canada-godbud.webp"
          alt="Buy Weed Online Canada - Godbud"
          fill
          className="hidden md:block object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Premium Cannabis
            <span className="block text-primary-200">Delivered</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
            High-quality cannabis, edibles, vapes, and concentrates delivered directly to your door.
          </p>
          <Link
            href="/categories/flowers"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg"
          >
            Shop Flowers
          </Link>
        </div>
      </div>

    </section>
  )
}


