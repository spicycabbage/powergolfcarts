export const metadata = {
  robots: process.env.NODE_ENV === 'production'
    ? { index: true, follow: true }
    : { index: false, follow: false }
}

export default function ConcentratesHub() {
  return (
    <main className="prose max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1>Cannabis Concentrates Guide</h1>
      <p>Quick overview of shatter, diamonds, rosin, plus storage and dosing best practices.</p>

      <nav>
        <ul>
          <li><a href="/learn/concentrates/shatter-vs-diamonds">Shatter vs Diamonds</a></li>
        </ul>
      </nav>

      <section>
        <h2>Shop picks</h2>
        <p>
          <a href="/products/blue-dream-shatter">Blue Dream Shatter</a> ·{' '}
          <a href="/products/wedding-cake-diamonds">Wedding Cake Diamonds</a> ·{' '}
          <a href="/categories/concentrates">Browse all concentrates</a>
        </p>
      </section>

      <section>
        <h2>FAQs</h2>
        <details><summary>Best temp for shatter?</summary><p>Lower temps preserve terpenes and smoothness.</p></details>
        <details><summary>How to store diamonds?</summary><p>Airtight glass, cool, and away from light.</p></details>
      </section>
    </main>
  )
}


