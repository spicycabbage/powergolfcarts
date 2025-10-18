export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout canceled</h1>
        <p className="text-gray-700 mb-8">You can review your cart and try again.</p>
        <a href="/cart" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Back to Cart</a>
      </div>
    </div>
  )
}


