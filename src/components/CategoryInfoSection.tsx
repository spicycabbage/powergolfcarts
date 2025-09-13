interface CategoryInfoSectionProps {
  categoryName: string
  categorySlug: string
  productCount: number
}

export function CategoryInfoSection({ categoryName, categorySlug, productCount }: CategoryInfoSectionProps) {

  return (
    <section className="mt-16 bg-gray-50 rounded-lg p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium {categoryName} - Buy Cannabis Online in Canada</h2>
        
        <p className="text-lg leading-relaxed mb-6 text-gray-700">
          Discover our exceptional collection of premium {categoryName.toLowerCase()}, featuring high-quality cannabis products carefully selected for their potency, purity, and value. Our {categoryName.toLowerCase()} selection represents the finest offerings from trusted Canadian producers, ensuring you receive premium cannabis products that meet the highest standards of quality and consistency.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Our {categoryName}?</h3>
            <p className="text-gray-700 leading-relaxed">
              Premium quality {categoryName.toLowerCase()} lab-tested for safety and potency. Sourced from licensed Canadian producers with competitive pricing and value. Fast, discreet shipping across Canada. Hand-selected from trusted Canadian growers with detailed strain information and effects. Properly cured and stored for maximum freshness with wide variety of THC and CBD levels.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage & Storage</h3>
            <p className="text-gray-700 leading-relaxed">
              Our {categoryName.toLowerCase()} are designed for responsible adult consumption. Start with recommended doses and consume in accordance with local laws. Store products safely away from children and pets in a cool, dry place. Cannabis products can be consumed through various methods including smoking, vaporizing, or using in homemade edibles.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg border mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
          <p className="text-gray-700 leading-relaxed">
            All {categoryName.toLowerCase()} in our collection are sourced from licensed Canadian producers and undergo rigorous quality testing to ensure safety, potency, and consistency. We carefully curate our selection to offer only the finest cannabis products available. Each batch is tested for pesticides, heavy metals, and microbials to ensure safety and quality.
          </p>
        </div>
        
        {productCount > 0 && (
          <p className="text-center text-gray-600">
            Currently featuring <strong>{productCount}</strong> premium {categoryName.toLowerCase()} products. 
            All items are in stock and ready for fast shipping across Canada.
          </p>
        )}
      </div>
    </section>
  )
}
