export default function TasmaniaG2Enhanced() {
  const specs = [
    { label: 'Model Name', value: 'Tasmania G2' },
    { label: 'Folded Size (Without Wheels)', value: '27 x 32 x 10 inch' },
    { label: 'Folded Size (With Wheels)', value: '29 x 34 x 15 inch' },
    { label: 'Net Weight', value: '16 Kg (35.3 LB)' },
    { label: 'Battery Type', value: '14.8 Volt, 20 Ah Lithium-Ion' },
    { label: 'Motors', value: '2 x 90 Watts Dual High Torque Motors' },
    { label: 'Battery Range', value: 'Up to 36 holes on single charge' },
    { label: 'Charging Time', value: '3-4 hours' },
    { label: 'Battery Cycles', value: '600+ charging cycles' },
    { label: 'Charger', value: '17v Lithium-Ion battery charger included' },
    { label: 'Speed Settings', value: '9 speeds (Handle dial & Remote)' },
    { label: 'Control Modes', value: 'Remote Control, Handle Dial Push, Manual Push' },
    { label: 'Front Wheel', value: '360 Swivel Front Wheel' },
    { label: 'Handle', value: 'Fully Adjustable' },
    { label: 'USB Port', value: 'Yes (for mobile devices, GPS, etc)' },
  ]

  return (
    <div className="space-y-8 py-12">
      {/* Specifications Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Tasmania G2 Specifications
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
                  <span><strong>Remote controlled</strong> electric golf trolley</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>360 Swivel front wheel</strong> for superior maneuverability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Super easy to set up and fold down:</strong> pull up the handle and click to set up</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Rechargeable Remote</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Carbon fibre wrapped,</strong> high-end appearance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span><strong>Great speed and slope control</strong></span>
                </li>
              </ul>
            </div>

            {/* 3 Different Modes */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">3 Different Modes:</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-800">
                <li>
                  <strong>Remote control mode</strong>
                </li>
                <li>
                  <strong>Handle dial push mode</strong>
                </li>
                <li>
                  <strong>Manual push mode when out of battery:</strong> Quick transition to Free-Wheel Mode, the trolley is light weight, easy to push and turn
                </li>
              </ol>
            </div>

            {/* Technical Features */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">Technical Features:</h3>
              <ul className="space-y-2 text-gray-800">
                <li><strong>9 speeds settings</strong> on handle dial and remote control</li>
                <li><strong>USB charging port</strong> for mobile devices, GPS, etc</li>
                <li><strong>Battery level indicator</strong></li>
                <li><strong>Dual high torque motors</strong> and enclosed gearbox</li>
                <li><strong>Fully Adjustable handle</strong></li>
                <li><strong>14.8 Volt, 20 Ah Lithium-Ion battery</strong></li>
                <li><strong>2 x 90 Watts Motors</strong></li>
              </ul>
            </div>

            {/* Battery & Performance */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">Battery & Performance:</h3>
              <ul className="space-y-2 text-gray-800">
                <li>Battery charges in <strong>3-4 hours</strong></li>
                <li>Good for up to <strong>36 holes</strong> on a single charge</li>
                <li>Battery rated at <strong>600+ charging cycles</strong></li>
                <li>Comes with <strong>17v Lithium-Ion battery charger</strong></li>
                <li><strong>One Year warranty</strong> on all electronic parts</li>
              </ul>
            </div>

            {/* Accessories Included */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">Included Accessories:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                <li>Free Score Card Holder</li>
                <li>Free Tee and Ball storage</li>
                <li>Free Large Drink Holder</li>
                <li>Free Umbrella Holder</li>
                <li>Free Mesh Bag</li>
                <li>Free Storage Bag</li>
                <li>Free Cooler Pocket</li>
                <li>USB Port</li>
                <li>Seat is Optional</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Warranty Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">🛡️ Warranty</h3>
          <p className="text-gray-700 leading-relaxed">
            Power Golf Carts will provide 1 year warranty on battery, cart motor and all electronic components under normal condition usage. Wear and tear parts are not covered. More detail on FAQ page.
          </p>
        </div>

        {/* Shipping Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">📦 Shipping Information</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Shipping and Handling Time</h4>
              <p>Shipping and handling time is about 1-8 business days within the United States, depending on customer location.</p>
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
            Check out our comprehensive assembly and setup videos:
          </p>
          <a 
            href="/videos" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Watch Installation Videos →
          </a>
        </div>
      </section>
    </div>
  )
}

