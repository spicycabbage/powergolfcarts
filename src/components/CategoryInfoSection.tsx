interface CategoryInfoSectionProps {
  categoryName: string
  categorySlug: string
  productCount: number
}

export function CategoryInfoSection({ categoryName, categorySlug, productCount }: CategoryInfoSectionProps) {

  return (
    <section className="mt-16 bg-gray-50 rounded-lg p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium {categoryName} - Buy Golf Cart Products Online</h2>
        
        <p className="text-lg leading-relaxed mb-6 text-gray-700">
          Discover our exceptional collection of premium {categoryName.toLowerCase()}, featuring high-quality golf cart products carefully selected for their performance, durability, and value. Our {categoryName.toLowerCase()} selection represents the finest offerings from trusted manufacturers, ensuring you receive premium golf cart products that meet the highest standards of quality and consistency.
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
              Our {categoryName.toLowerCase()} are designed for optimal golf cart performance. Follow manufacturer guidelines for proper installation and maintenance. Store products safely in a dry, temperature-controlled environment. Golf cart products can be used for various applications including course navigation, maintenance, and recreational use.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg border mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
          <p className="text-gray-700 leading-relaxed">
            All {categoryName.toLowerCase()} in our collection are sourced from licensed manufacturers and undergo rigorous quality testing to ensure safety, performance, and consistency. We carefully curate our selection to offer only the finest golf cart products available. Each product is tested for durability, safety standards, and performance specifications to ensure quality and reliability.
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
