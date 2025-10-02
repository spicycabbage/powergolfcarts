import { OptimizedImage } from '@/components/OptimizedImage'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative text-white overflow-hidden h-[350px] md:h-[500px]">
      {/* Background Image - Electric Power Golf Caddy */}
      <div className="absolute inset-0">
        <Image
          src="/electric-power-golf-caddy.jpg"
          alt="Electric Power Golf Cart - Power Golf Carts"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Power Golf Carts
            <span className="block text-green-200">Power Your Game</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-green-100 mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
            Premium electric golf caddies and E-Carts for effortless course navigation and enhanced golfing experience.
          </p>
          <Link
            href="/categories/e-carts"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg"
          >
            Shop E-Carts
          </Link>
        </div>
      </div>

    </section>
  )
}


