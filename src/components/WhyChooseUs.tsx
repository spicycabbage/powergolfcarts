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
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Godbud.cc?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Your trusted source for premium cannabis products in Canada.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mx-auto">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
