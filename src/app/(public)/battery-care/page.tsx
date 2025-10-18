import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Battery Care | Power Golf Carts',
  description: 'Learn how to properly care for and maintain your lithium battery to maximize its lifespan and performance.',
}

export default function BatteryCarePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Battery Care</h1>
          
          <div className="prose prose-gray max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How do I take good care of my lithium battery?</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Charging Best Practices</h3>
                <p className="text-gray-700 leading-relaxed">
                  Do not overcharge your battery. Charging your battery to 100% and leaving it in the charger for a long time can reduce the battery life.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">Regular Maintenance</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Don't drop your battery and keep its terminals clean. Check on your batteries from time to time in case they are draining themselves.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Long-Term Storage</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are not going to use your battery for a few months, check on your battery every 2-3 months. Your battery may have lost some charge in that time. Charge it to about 50%, then store it in a secure place.
                </p>
                <div className="bg-red-100 border border-red-300 rounded p-4 mt-4">
                  <p className="text-red-800 font-semibold">
                    ⚠️ Important: It is not recommended to store the battery completely flat (empty). It can impact battery life or the battery appears to be dead.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Where should I store my lithium battery?</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Temperature Guidelines</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Store your batteries at room temperature (around 20 degrees C). Don't store them near a heater, oven, or near a window with direct sunlight.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Storing the battery at a constant high temperature can significantly reduce its lifespan, run time and charge capacity. It can also permanently damage the batteries. Storing the battery in extreme cold places will drain the battery quickly.
                </p>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-cyan-900 mb-3">Humidity Control</h3>
                <p className="text-gray-700 leading-relaxed">
                  Store your batteries in a dry location. Moisture or too much humidity can damage the batteries. You can use silica crystal moisture absorbing sachets to keep the batteries dry.
                </p>
              </div>
            </section>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 my-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Tips Summary</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Avoid overcharging - don't leave at 100% for extended periods</li>
                <li>Keep terminals clean and handle with care</li>
                <li>Check batteries every 2-3 months during storage</li>
                <li>Store at 50% charge for long-term storage</li>
                <li>Never store completely flat/empty</li>
                <li>Store at room temperature (~20°C)</li>
                <li>Avoid heat sources and direct sunlight</li>
                <li>Keep in dry location, use moisture absorbers if needed</li>
              </ul>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 my-8">
              <h3 className="text-xl font-semibold text-primary-900 mb-3">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you have questions about battery care or experience any issues with your battery, please contact us.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:info@powergolfcarts.com" className="text-primary-600 hover:text-primary-700">
                    info@powergolfcarts.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Phone:</strong>{' '}
                  <a href="tel:1-778-861-8599" className="text-primary-600 hover:text-primary-700">
                    1-778-861-8599
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Text Support:</strong>{' '}
                  <a href="tel:1-604-319-4330" className="text-primary-600 hover:text-primary-700">
                    1-604-319-4330
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

