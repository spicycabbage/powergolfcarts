import { useState, useEffect } from 'react'

interface CategoryInfoSectionProps {
  categoryName: string
  categorySlug: string
  productCount: number
}

const categoryContent: Record<string, {
  title: string
  description: string
  benefits: string[]
  usage: string
  quality: string
}> = {
  'flowers': {
    title: 'Premium Cannabis Flowers - Buy Weed Online in Canada',
    description: 'Discover our extensive collection of premium cannabis flowers, featuring over 40 unique strains from top Canadian growers. Our flower selection includes indica, sativa, and hybrid varieties, each carefully cultivated and cured to deliver exceptional potency, flavor, and aroma. From classic strains like Pink Kush and Afghan Hash to modern favorites like Wedding Cake and Gelato, we offer something for every cannabis enthusiast.',
    benefits: [
      'Hand-selected from trusted Canadian growers',
      'Lab-tested for potency and purity',
      'Properly cured and stored for maximum freshness',
      'Wide variety of THC and CBD levels',
      'Detailed strain information and effects'
    ],
    usage: 'Cannabis flowers can be consumed through various methods including smoking, vaporizing, or using in homemade edibles. Start with small amounts to gauge effects, especially with high-THC strains. Store in a cool, dry place away from light to maintain potency and freshness.',
    quality: 'All our cannabis flowers are sourced from licensed Canadian producers who follow strict cultivation standards. Each batch is tested for pesticides, heavy metals, and microbials to ensure safety and quality. We inspect every product before shipping to guarantee you receive only the finest cannabis flowers available in Canada.'
  },
  'edibles': {
    title: 'Cannabis Edibles - Delicious THC & CBD Treats',
    description: 'Explore our delicious selection of cannabis edibles, including gummies, chocolates, beverages, and baked goods. Our edibles offer a discreet and convenient way to consume cannabis, with precise dosing and long-lasting effects. Perfect for both beginners and experienced users, our edibles range from low-dose CBD options to potent THC treats.',
    benefits: [
      'Precise dosing for consistent effects',
      'Long-lasting relief (4-8 hours)',
      'Discreet and convenient consumption',
      'No smoking or vaporizing required',
      'Wide variety of flavors and formats'
    ],
    usage: 'Start with a low dose (2.5-5mg THC) and wait at least 2 hours before consuming more, as edibles can take 30 minutes to 2 hours to take effect. Effects typically last 4-8 hours. Store in a cool, dry place and keep away from children and pets.',
    quality: 'Our edibles are made by licensed Canadian producers using high-quality ingredients and precise extraction methods. Each product is lab-tested for accurate dosing and contaminant-free formulation. We ensure consistent potency and quality across all our edible products.'
  },
  'concentrates': {
    title: 'Cannabis Concentrates - Shatter, Wax, Live Resin & More',
    description: 'Experience the purest and most potent cannabis products with our premium concentrate collection. Featuring shatter, wax, live resin, rosin, and diamonds, our concentrates offer exceptional potency and flavor profiles. Perfect for experienced users seeking maximum effects and connoisseurs who appreciate refined cannabis products.',
    benefits: [
      'High potency (60-90% THC)',
      'Pure, clean extraction methods',
      'Intense flavor and aroma profiles',
      'Small amounts provide strong effects',
      'Various textures and consistencies'
    ],
    usage: 'Concentrates require specialized equipment like dab rigs, vaporizers, or e-nails. Start with very small amounts (rice grain size) as concentrates are extremely potent. Store in a cool, dark place in airtight containers to preserve quality and potency.',
    quality: 'Our concentrates are extracted using state-of-the-art methods including CO2, butane, and solventless techniques. All products undergo rigorous testing for residual solvents, pesticides, and potency to ensure the highest quality and safety standards.'
  },
  'hash': {
    title: 'Traditional Hash - Afghan, Lebanese, Moroccan & More',
    description: 'Discover our authentic hash collection featuring traditional varieties from around the world. Our hash selection includes Afghan, Lebanese, Moroccan, and modern bubble hash, each offering unique flavors, aromas, and effects. Made using time-honored techniques, our hash provides a classic cannabis experience with rich, complex profiles.',
    benefits: [
      'Traditional production methods',
      'Rich, complex flavor profiles',
      'Moderate to high potency',
      'Versatile consumption options',
      'Cultural cannabis heritage'
    ],
    usage: 'Hash can be smoked in pipes, joints, or vaporized. Break off small pieces and mix with flower or consume on its own. Start with small amounts as hash can be quite potent. Store in a cool, dry place wrapped in parchment paper.',
    quality: 'Our hash is sourced from experienced producers who use traditional methods passed down through generations. Each variety is carefully selected for authenticity, potency, and flavor. We ensure proper storage and handling to maintain the integrity of these classic cannabis products.'
  },
  'vapes': {
    title: 'Cannabis Vapes - Cartridges, Disposables & Devices',
    description: 'Browse our comprehensive vape collection featuring cartridges, disposable pens, and vaping devices. Our vapes offer a clean, convenient way to consume cannabis with precise dosing and immediate effects. Choose from a variety of strains, potencies, and formats to find the perfect vaping experience.',
    benefits: [
      'Clean, smoke-free consumption',
      'Immediate onset of effects',
      'Portable and discreet',
      'Precise dosage control',
      'No combustion or ash'
    ],
    usage: 'Simply inhale from the mouthpiece to activate. Start with small puffs and wait a few minutes between uses to gauge effects. Store upright in a cool place and avoid extreme temperatures. Battery-powered devices may require charging.',
    quality: 'Our vape products are manufactured by licensed Canadian producers using high-quality cannabis oil and safe extraction methods. All cartridges and devices undergo testing for heavy metals, pesticides, and potency to ensure safe and consistent performance.'
  },
  'cbd': {
    title: 'CBD Products - Oils, Capsules, Topicals & More',
    description: 'Explore our therapeutic CBD product line designed for wellness and relief without psychoactive effects. Our CBD collection includes oils, capsules, topicals, and edibles, all made from high-quality hemp and cannabis plants. Perfect for those seeking the therapeutic benefits of cannabis without the high.',
    benefits: [
      'Non-psychoactive therapeutic effects',
      'Various consumption methods',
      'Potential anti-inflammatory properties',
      'May help with anxiety and sleep',
      'Legal across Canada'
    ],
    usage: 'CBD products can be taken sublingually, swallowed, or applied topically depending on the format. Start with low doses and gradually increase as needed. Effects may take 30 minutes to 2 hours depending on consumption method.',
    quality: 'Our CBD products are extracted from premium cannabis and hemp plants using CO2 extraction methods. All products are third-party tested for potency, pesticides, and heavy metals to ensure purity and safety. We provide detailed lab reports for transparency.'
  }
}

export function CategoryInfoSection({ categoryName, categorySlug, productCount }: CategoryInfoSectionProps) {
  // Lazy load this component to improve initial page load
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000) // Delay 1 second
    return () => clearTimeout(timer)
  }, [])
  
  if (!isVisible) {
    return <div className="mt-16 h-96" /> // Placeholder to maintain layout
  }
  
  const content = categoryContent[categorySlug.toLowerCase()] || {
    title: `${categoryName} - Premium Cannabis Products`,
    description: `Browse our selection of high-quality ${categoryName.toLowerCase()} from trusted Canadian suppliers. Each product is carefully selected for quality, potency, and value, ensuring you receive only the best cannabis products available in Canada.`,
    benefits: [
      'High-quality Canadian products',
      'Lab-tested for safety and potency',
      'Competitive pricing',
      'Fast, discreet shipping',
      'Excellent customer service'
    ],
    usage: 'Please consume responsibly and in accordance with local laws. Start with small amounts to gauge effects and store products safely away from children and pets.',
    quality: 'All our products are sourced from licensed Canadian producers and undergo rigorous quality testing to ensure safety, potency, and consistency.'
  }

  return (
    <div className="mt-16 bg-gray-50 rounded-lg p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{content.title}</h2>
        
        <div className="prose max-w-none text-gray-700 mb-8">
          <p className="text-lg leading-relaxed mb-6">{content.description}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Our {categoryName}?</h3>
              <ul className="space-y-2">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage & Storage</h3>
              <p className="leading-relaxed">{content.usage}</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
            <p className="leading-relaxed">{content.quality}</p>
          </div>
          
          {productCount > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Currently featuring <strong>{productCount}</strong> premium {categoryName.toLowerCase()} products. 
                All items are in stock and ready for fast shipping across Canada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
