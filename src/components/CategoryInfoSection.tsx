// Server-side component for better SEO

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

// Enhanced content generation for sub-categories
const generateDynamicContent = (categoryName: string, categorySlug: string) => {
    const slug = categorySlug.toLowerCase()
    const name = categoryName.toLowerCase()
    
    // Check for specific sub-category patterns
    if (slug.includes('indica')) {
      return {
        title: `${categoryName} - Premium Indica Cannabis Strains`,
        description: `Discover our exceptional collection of ${name} indica strains, known for their relaxing, body-focused effects. These indica-dominant varieties are perfect for evening use, stress relief, and promoting restful sleep. Our ${name} selection features potent, high-quality strains that deliver the classic indica experience of deep relaxation and physical comfort.`,
        benefits: [
          'Relaxing, body-focused effects',
          'Perfect for evening and nighttime use',
          'May help with sleep and stress relief',
          'High-quality indica genetics',
          'Lab-tested for potency and purity'
        ],
        usage: `${categoryName} indica strains are best consumed in the evening due to their sedating effects. Start with small amounts to gauge tolerance, especially with high-THC varieties. These strains are ideal for relaxation, pain relief, and promoting sleep.`,
        quality: `Our ${name} indica collection features premium strains from licensed Canadian growers, each carefully selected for their authentic indica characteristics, potency, and therapeutic potential.`
      }
    }
    
    if (slug.includes('sativa')) {
      return {
        title: `${categoryName} - Energizing Sativa Cannabis Strains`,
        description: `Explore our vibrant collection of ${name} sativa strains, celebrated for their uplifting, cerebral effects and energizing properties. These sativa-dominant varieties are perfect for daytime use, creative activities, and social situations. Our ${name} selection offers premium strains that deliver the classic sativa experience of mental clarity and euphoric energy.`,
        benefits: [
          'Uplifting, cerebral effects',
          'Perfect for daytime and social use',
          'May enhance creativity and focus',
          'Energizing and mood-lifting',
          'Premium sativa genetics'
        ],
        usage: `${categoryName} sativa strains are ideal for daytime consumption due to their energizing effects. Start with moderate doses to enjoy the uplifting benefits without overwhelming stimulation. Great for creative projects, social activities, and active pursuits.`,
        quality: `Our ${name} sativa collection features exceptional strains from trusted Canadian producers, selected for their authentic sativa characteristics, potency, and ability to deliver energizing, uplifting effects.`
      }
    }
    
    if (slug.includes('hybrid')) {
      return {
        title: `${categoryName} - Balanced Hybrid Cannabis Strains`,
        description: `Experience the best of both worlds with our ${name} hybrid collection, featuring strains that combine indica and sativa characteristics for balanced, versatile effects. These carefully bred hybrids offer the perfect middle ground, providing both mental stimulation and physical relaxation. Our ${name} selection includes both indica-dominant and sativa-dominant hybrids to suit any preference.`,
        benefits: [
          'Balanced indica and sativa effects',
          'Versatile for any time of day',
          'Combines mental and physical benefits',
          'Wide variety of effect profiles',
          'Premium hybrid genetics'
        ],
        usage: `${categoryName} hybrid strains offer flexibility in consumption timing and effects. Start with small amounts to understand the specific balance of each strain. Effects can range from energizing to relaxing depending on the hybrid's dominant characteristics.`,
        quality: `Our ${name} hybrid collection features expertly bred strains from licensed Canadian producers, each selected for their unique balance of effects, potency, and consistent quality.`
      }
    }
    
    if (slug.includes('gummies') || slug.includes('gummy')) {
      return {
        title: `${categoryName} - Delicious Cannabis Gummies`,
        description: `Enjoy our premium selection of ${name}, offering a tasty and convenient way to consume cannabis. These precisely dosed gummies provide consistent effects with delicious flavors, making them perfect for both beginners and experienced users. Our ${name} collection features various potencies and flavor profiles to suit every preference.`,
        benefits: [
          'Precise, consistent dosing',
          'Delicious flavors and textures',
          'Discreet and portable',
          'Long-lasting effects (4-8 hours)',
          'No smoking or vaporizing required'
        ],
        usage: `Start with one ${name.slice(0, -1)} (typically 2.5-10mg THC) and wait at least 2 hours before consuming more. Effects can take 30 minutes to 2 hours to onset and typically last 4-8 hours. Store in a cool, dry place away from children.`,
        quality: `Our ${name} are made by licensed Canadian producers using high-quality ingredients and precise extraction methods. Each batch is lab-tested for accurate dosing and contaminant-free formulation.`
      }
    }
    
    if (slug.includes('chocolate')) {
      return {
        title: `${categoryName} - Premium Cannabis Chocolates`,
        description: `Indulge in our luxurious ${name} collection, combining the rich taste of premium chocolate with precisely dosed cannabis. These artisanal treats offer a sophisticated way to consume cannabis, with smooth, long-lasting effects. Our ${name} selection features various cocoa percentages and potencies for the perfect cannabis chocolate experience.`,
        benefits: [
          'Premium chocolate quality',
          'Precise cannabis dosing',
          'Luxurious taste experience',
          'Long-lasting effects',
          'Elegant, discreet consumption'
        ],
        usage: `Consume ${name} slowly, starting with small pieces to gauge effects. Allow 1-2 hours for full onset. Store in a cool, dry place to maintain chocolate quality and potency. Keep away from heat and direct sunlight.`,
        quality: `Our ${name} are crafted by expert chocolatiers and licensed cannabis producers, using premium cocoa and high-quality cannabis extracts. Each product is tested for potency and purity.`
      }
    }
    
    // Default dynamic content for any other sub-category
    return {
      title: `${categoryName} - Premium Cannabis Products in Canada`,
      description: `Discover our exceptional ${name} collection, featuring high-quality cannabis products carefully selected for their potency, purity, and value. Our ${name} selection represents the finest offerings from trusted Canadian producers, ensuring you receive premium cannabis products that meet the highest standards of quality and consistency.`,
      benefits: [
        `Premium quality ${name}`,
        'Lab-tested for safety and potency',
        'Sourced from licensed Canadian producers',
        'Competitive pricing and value',
        'Fast, discreet shipping across Canada'
      ],
      usage: `Our ${name} are designed for responsible adult consumption. Start with recommended doses and consume in accordance with local laws. Store products safely away from children and pets in a cool, dry place.`,
      quality: `All ${name} in our collection are sourced from licensed Canadian producers and undergo rigorous quality testing to ensure safety, potency, and consistency. We carefully curate our selection to offer only the finest cannabis products available.`
    }
  }

export function CategoryInfoSection({ categoryName, categorySlug, productCount }: CategoryInfoSectionProps) {
  // Server-side content generation for better SEO
  const content = categoryContent[categorySlug.toLowerCase()] || generateDynamicContent(categoryName, categorySlug)

  return (
    <section className="mt-16 bg-gray-50 rounded-lg p-8">
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
            <p className="mt-6 text-center text-gray-600">
              Currently featuring <strong>{productCount}</strong> premium {categoryName.toLowerCase()} products. 
              All items are in stock and ready for fast shipping across Canada.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
