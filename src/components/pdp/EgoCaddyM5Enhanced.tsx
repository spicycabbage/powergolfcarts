export default function EgoCaddyM5Enhanced() {
  const specs = [
    { label: 'Model Name', value: 'Ego Caddy' },
    { label: 'Folded Size', value: '24.4 x 24.7 x 13.4 Inches' },
    { label: 'Expanded Size', value: '35 x 24.7 x 42.9 Inches' },
    { label: 'Cart Weight', value: '32 LB (14.5 KG)' },
    { label: 'Battery Weight', value: '4.4 LB (2 KG)' },
    { label: 'Number of Wheels', value: '6' },
    { label: 'Swivel Front Wheels', value: 'Yes' },
    { label: 'Body Frame Material', value: 'Lightweight Aircraft-Grade Aluminum' },
    { label: 'Remote Control Mode', value: 'Smart Follow, Remote Control, Manual Push' },
    { label: 'Removable Battery', value: 'Yes/ Swappable' },
    { label: 'Foldable', value: 'Yes' },
    { label: 'Smart Control System', value: 'Auto Brake, Auto Balancing, Auto Slope' },
    { label: 'Mobile App', value: 'IOS / Android' },
    { label: 'Battery Type', value: 'Rechargeable Lithium-ion battery' },
    { label: 'Battery Life', value: '36 to 45 Holes (20 Miles)' },
    { label: 'Remote Distance', value: '65.6 ft (Open Space)' },
  ]

  return (
    <div className="space-y-16 py-12">
      {/* Specifications Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Ego Caddy Specifications
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-200">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-4 p-4 md:p-6 hover:bg-green-50 transition-colors"
                >
                  <div className="font-semibold text-gray-700">{spec.label}</div>
                  <div className="text-gray-900 font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

