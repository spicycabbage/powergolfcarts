export const metadata = {
  robots: process.env.NODE_ENV === 'production'
    ? { index: true, follow: true }
    : { index: false, follow: false }
}

export default function ShatterVsDiamonds() {
  return (
    <article className="prose max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <a href="/learn" className="hover:underline">Learn</a> 
        {' › '}<a href="/learn/concentrates" className="hover:underline">Concentrates</a> 
        {' › '}Shatter vs Diamonds
      </nav>

      <h1>Shatter vs Diamonds</h1>
      <p>Compare texture, flavor, and potency so you can pick the format that fits your goals.</p>

      <h2>Key differences</h2>
      <ul>
        <li><strong>Shatter</strong>: stable, glassy sheets; consistent potency and easy handling.</li>
        <li><strong>Diamonds</strong>: THCa crystals; intense effects, often paired with terp sauce.</li>
      </ul>

      <h2>Try these</h2>
      <p>
        <a href="/products/la-kush-cake-shatter">LA Kush Cake Shatter</a> and{' '}
        <a href="/products/wedding-cake-diamond">Wedding Cake Diamond</a>
      </p>
    </article>
  )
}


