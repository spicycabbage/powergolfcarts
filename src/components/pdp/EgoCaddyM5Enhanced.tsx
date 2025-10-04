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

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Features
          </h2>
          
          <div className="space-y-6">
            {/* Design and Battery */}
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-800 leading-relaxed mb-4">
                <strong>Foldable design</strong> with durable light-weight aluminum frame and wrapped with carbon fiber, high-end appearance
              </p>
              <p className="text-gray-800 leading-relaxed">
                <strong>36-45 Holes</strong> long range lithium battery
              </p>
            </div>

            {/* 3 Different Modes */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">3 Different Modes:</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-800">
                <li>
                  <strong>Accurate Smart Follow Mode:</strong> The best following mode you have ever experienced. Make you to enjoy walking and shoot better score
                </li>
                <li>
                  <strong>Remote Control Mode</strong>
                </li>
                <li>
                  <strong>Manual Push Mode</strong>
                </li>
              </ol>
            </div>

            {/* Smart Engine */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-3">Smart Engine:</h3>
              <p className="text-gray-800">Auto-balancing, Slope and speed control</p>
            </div>

            {/* Egocaddy Mobile App */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">Use Egocaddy Mobile App:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-800">
                <li>Control and monitor the cart</li>
                <li>Check battery levels</li>
                <li>Mileage Remaining</li>
                <li>Change cart walking speed</li>
                <li>Change following distance</li>
                <li><strong>Gravity Control Feature:</strong> Makes it more fun to use your phone to control the cart</li>
                <li>Egocaddy APP is available both on <strong>iOS and Android</strong></li>
              </ol>
            </div>

            {/* Additional Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">🎥 Swing Recorder</h4>
                <p className="text-gray-800">Use remote control to record swing with slow motion playback.</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">🎮 Remote Controller</h4>
                <p className="text-gray-800">Fun somatosensory remote controllable.</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">🛞 Swivel Front Wheels</h4>
                <p className="text-gray-800">2 Swivel front wheels with brakes</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">⚙️ Advanced Settings</h4>
                <p className="text-gray-800">Monitor and make advanced settings to customize your own Ego Caddy Electric Golf trolley.</p>
              </div>
            </div>

            {/* Accessories Included in Features */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">Accessories Included:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                <li>Free Score Card Holder</li>
                <li>Free Tees and Balls storage</li>
                <li>Free Large Drink Holder</li>
                <li>Free Umbrella Holder</li>
                <li>USB Port</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Warning Section */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Warning</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Water Resistance:</strong> Power Golf Carts smart follow me cart is water-resistant and safe to use under normal condition of rain will not damage the trolley. However, this E-caddy is not waterproof. The battery and mainboard will die if it goes into a water hazard such as a pond or lake. This is not covered under the warranty plan.
            </p>
            <p>
              <strong>Smart Follow Mode Usage:</strong> The Smart Follow Mode is not allowed to use in crowded areas or parking lots. All smart follow me carts must be manually pushed in crowded places. The Follow Mode can only be used to play on the fairway. All accidents and damages caused by improper handling are the responsibility of the user.
            </p>
          </div>
        </div>

        {/* Mobile App Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">📱 Smart Follow Me Cart Mobile App</h3>
          <p className="text-gray-700">
            The Mobile App is available on <strong>iOS and Android</strong>
          </p>
        </div>

        {/* Warranty Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">🛡️ Warranty</h3>
          <p className="text-gray-700 leading-relaxed">
            The Power Golf Carts smart follow me cart, charger and battery are covered by a 1 year warranty from the date of purchase. The warranty covers manufacturing defects that occur during normal use and only applies to new follow me carts. Any breakage caused by accidental damage, or as a result of abuse or misuse, are not covered by the warranty. The warranty is not transferable. Used follow me carts are not subject to any warranty unless specified.
          </p>
        </div>

        {/* Shipping Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">📦 Shipping Information</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Shipping Time</h4>
              <p>Shipping and handling time is about 1-8 business days within the United States, depending on customer location.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">US Shipping Fee</h4>
              <p>Free shipping within the USA for this product.</p>
            </div>
            <p className="text-sm italic">
              Note: US orders may be subject to local state taxes, customs inspection fees, import fees and/or regulatory fees depending on your jurisdiction for which the recipient will be responsible.
            </p>
          </div>
        </div>

        {/* Accessories Included */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">🎁 Accessories Included</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Remote control</li>
            <li>Free Score Card Holder</li>
            <li>Free Tees and Balls storage</li>
            <li>Free Large Drink Holder (Cup holder)</li>
            <li>Free Umbrella Holder</li>
            <li>USB Port for device charging</li>
          </ul>
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

