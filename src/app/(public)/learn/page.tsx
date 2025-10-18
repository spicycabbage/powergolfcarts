export const metadata = {
  robots: process.env.NODE_ENV === 'production'
    ? { index: true, follow: true }
    : { index: false, follow: false }
}

export default function LearnIndex() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Explore guides that explain concentrates, vapes, edibles, storage, and dosing. Use these
            topics to choose confidently and get more from every session.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 grid-cols-1 md:grid-cols-2">
        <a href="/learn/concentrates" className="block rounded-lg border bg-white p-5 hover:shadow">
          <h2 className="text-xl font-semibold text-gray-900">Concentrates</h2>
          <p className="text-gray-600 mt-1">Shatter, diamonds, rosin, storage and dosing basics.</p>
          <span className="text-primary-700 text-sm mt-2 inline-block">View guide →</span>
        </a>
      </div>
    </main>
  )
}


