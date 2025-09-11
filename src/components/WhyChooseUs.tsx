import { Star, Tag, Package, ThumbsUp } from 'lucide-react'

const features = [
  {
    name: 'Top Quality Product',
    description: 'We source only the highest quality cannabis through our top-notch network of suppliers, ensuring every product meets our exacting standards.',
    icon: Star,
  },
  {
    name: 'Great Prices',
    description: 'Our direct relationships with large-scale suppliers allow us to offer some of the most competitive prices on the market when you buy weed online.',
    icon: Tag,
  },
  {
    name: 'Extensive Catalogue',
    description: 'We carry a wide selection of premium cannabis flowers, CBD products, concentrates, edibles, and vapes from top Canadian brands.',
    icon: Package,
  },
  {
    name: '100% Satisfaction',
    description: 'We want you to shop with peace of mind. If you are not satisfied with your purchase, contact us, and we will make things right.',
    icon: ThumbsUp,
  },
]

export function WhyChooseUs() {
  return (
    <div className="bg-gray-900 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="text-center text-white">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-500 text-white mx-auto mb-4">
                <feature.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.name}</h3>
              <p className="text-gray-300 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
