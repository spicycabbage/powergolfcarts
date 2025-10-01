import { Star, Tag, Package, ThumbsUp } from 'lucide-react'

const features = [
  {
    name: 'Premium Equipment',
    description: 'We source only the highest quality golf equipment from leading brands, ensuring every product meets tour-level standards for performance.',
    icon: Star,
  },
  {
    name: 'Competitive Prices',
    description: 'Our direct relationships with major golf brands allow us to offer some of the most competitive prices on premium golf equipment.',
    icon: Tag,
  },
  {
    name: 'Extensive Selection',
    description: 'We carry a wide selection of golf clubs, balls, bags, accessories, and apparel from top brands like TaylorMade, Callaway, Titleist, and more.',
    icon: Package,
  },
  {
    name: '100% Satisfaction',
    description: 'We want you to shop with confidence. If you are not satisfied with your purchase, contact us, and we will make things right.',
    icon: ThumbsUp,
  },
]

export function WhyChooseUs() {
  return (
    <section className="bg-gray-900 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="text-white">
              <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary-400" aria-hidden="true" />
              <h2 className="text-lg font-bold mb-2">{feature.name}</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
