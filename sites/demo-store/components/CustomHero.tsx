import React from 'react'
import { getSiteConfig } from '../../../src/lib/config'

const CustomHero: React.FC = () => {
  const config = getSiteConfig()

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to {config.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover the latest fashion trends and express your unique style
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              style={{
                backgroundColor: config.theme.primary,
                color: 'white'
              }}
            >
              Shop Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              View Collections
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomHero




