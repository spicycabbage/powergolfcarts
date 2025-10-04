export default function VoltCaddyEnhanced() {
  const specs = [
    { label: 'Model Name', value: 'Volt Caddy' },
    { label: 'Motors', value: '360W (2 x 180W) Dual Powerful Quiet Motors' },
    { label: 'Battery Range', value: 'Up to 36 Holes or more' },
    { label: 'Max Climbing Angle', value: '30 Degrees' },
    { label: 'Control Mode', value: 'Variable speed remote control' },
    { label: 'USB Ports', value: '2 USB Type-C charging ports' },
    { label: 'EWheels Net Weight', value: '17.93 kg (39.5 LB)' },
    { label: 'Design', value: 'Compact and foldable' },
    { label: 'Anti-Tip Wheels', value: '2 Removable back wheels' },
  ]

  return (
    <div className="space-y-8 py-12">
      {/* Specifications Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Volt Caddy Specifications
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

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Features
          </h2>
          
          <div className="space-y-6">
            {/* Key Features */}
            <div className="bg-green-50 p-6 rounded-lg">
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Removable Ewheels and trolley,</strong> easy to store in the car</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>360W (2 x 180W) Dual Powerful Quiet Motors</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Ideal for climbing</strong> up and down super hilly golf course</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Variable speed remote control mode</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>2 Removable anti-tip back wheels</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Lithium Battery</strong> one charging can go up to 36 Holes or more</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>2 USB Type-C charging ports</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Max Climbing Capacity of 30 Degrees</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Excellent slope control</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Automatic balancing and braking system</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Get 1 Free Gift: <strong>Microfiber golf towel</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Accessories Included */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">🎁 Accessories Included</h3>
          <p className="text-gray-700">
            Remote control, battery charger, cup holder, scorecard holder, umbrella holder, storage bag with cooler pocket, wheel holder stand, tee and ball holder, USB port. <strong>Get 1 free Gift: Microfiber golf towel.</strong>
          </p>
        </div>

        {/* Warranty Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">🛡️ Warranty</h3>
          <p className="text-gray-700 leading-relaxed">
            1 year manufacturer warranty provided by Volt Caddy. Please contact Volt Caddy for warranty service.
          </p>
        </div>

        {/* Shipping Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">📦 Shipping Information</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Shipping and Handling Time</h4>
              <p>Shipping and handling time is between 2-8 business days after order completion.</p>
            </div>
            <p className="text-sm italic">
              Note: US orders may be subject to local state taxes, customs inspection fees, import fees and/or regulatory fees depending on your jurisdiction for which the recipient will be responsible.
            </p>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">📹 Installation Instructions & User Manual</h3>
          <p className="text-gray-700 mb-4">
            Check out our comprehensive assembly and setup videos or download the user manual:
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/videos" 
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Watch Installation Videos →
            </a>
            <a 
              href="/manuals/volt-caddy-quick-start-guide.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 Download Manual
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

