import Image from 'next/image'

export default function RoberaProEnhanced() {
  const batteryStats = [
    { value: '＞18-36 Holes', label: 'Support a full game' },
    { value: '6 Hours', label: 'Extra long battery life' },
  ]

  const features = [
    { image: '/robera/ai-vision.jpg', title: 'AI Vision' },
    { image: '/robera/auto-follow.jpg', title: 'Auto Follow' },
    { image: '/robera/no-go.jpg', title: 'No-Go Zones Detection' },
    { image: '/robera/gesture.jpg', title: 'Gesture Control' },
    { image: '/robera/obstacles.jpg', title: 'Obstacles Avoidance' },
    { image: '/robera/summon.jpg', title: 'Remote Summon' },
    { image: '/robera/anti-tipping.jpg', title: 'Anti-Tipping' },
    { image: '/robera/remote.jpg', title: 'Remote Control' },
  ]

  const specs = [
    { label: 'Dimensions', value: '1124.2mm × 1180.97mm × 626mm' },
    { label: 'Folding Dimensions', value: '449.5mm × 688.06mm × 444mm' },
    { label: 'Max Climbing Angle', value: '25°' },
    { label: 'Marching Speed', value: '0-2.5 m/s' },
    { label: 'Response Distance', value: '0-15m' },
    { label: 'Remote Control Distance', value: '100m' },
    { label: 'Battery Capacity', value: '43200mAh' },
    { label: 'Play Duration', value: '18-36 Holes' },
    { label: 'Battery Life', value: '6 Hours' },
    { label: 'Charging Duration', value: '3.5 Hours' },
    { label: 'USB Port', value: 'Type A, Type C' },
    { label: 'Weight', value: '17.5 KG' },
  ]

  const faqs = [
    {
      question: 'How does Robera Pro perform in deep rough or thick wooded areas?',
      answer: 'Robera Pro smart golf caddy has an off-road mode designed for dense jungle terrain. It can handle slopes up to 25 degrees and navigate through tight spaces of 1.2 meters wide.',
    },
    {
      question: 'Is there a GPS feature with Robera Pro?',
      answer: "Not in this version, but it's on the roadmap for future updates.",
    },
    {
      question: 'Can the wheels move in any direction?',
      answer: 'Yes, Robera Pro features omnidirectional wheels for effortless movement in any direction.',
    },
    {
      question: "Why aren't the wheels telescopic for stability?",
      answer: "Robera Pro's design focuses on optimal performance with a powerful motor and intelligent systems, ensuring stability without telescopic wheels.",
    },
    {
      question: "What is the Robera Pro's fifth wheel for?",
      answer: 'The fifth wheel of Robera Pro is designed for enhanced stability on steep terrain and can be easily folded back for regular use with the built-in intelligent balance system.',
    },
    {
      question: 'What is the dimension and folding dimension of Robera Pro AI golf caddy?',
      answer: 'Dimension: 1124.2mm × 1180.97mm × 626mm\nFolding Dimension: 449.5mm × 688.06mm × 444mm',
    },
  ]

  return (
    <div className="space-y-16 py-12">
      {/* Battery Capacity Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Massive Battery Capacity
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {batteryStats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600">
                    {stat.value}
                  </div>
                  <div className="text-lg md:text-xl font-semibold text-gray-700">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Quick Overview of Robera Pro
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center space-y-3 group cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-800 text-center">
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Robera Pro Specifications
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-200">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-4 p-4 md:p-6 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-gray-700">{spec.label}</div>
                  <div className="text-gray-900 font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <summary className="cursor-pointer p-6 font-semibold text-lg text-gray-900 flex justify-between items-center">
                  <span className="pr-8">{faq.question}</span>
                  <svg
                    className="w-6 h-6 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-700 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

