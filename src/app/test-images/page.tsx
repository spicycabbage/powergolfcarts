export default function TestImagesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-bold mb-2">Logo (should work):</h2>
          <img 
            src="/uploads/logo-1756956312364.jpg" 
            alt="Logo" 
            className="w-64 h-64 object-cover border"
          />
        </div>
        
        <div>
          <h2 className="font-bold mb-2">Product Image:</h2>
          <img 
            src="/uploads/products/prod-1757021265737.jpg" 
            alt="Product" 
            className="w-64 h-64 object-cover border"
          />
        </div>
        
        <div>
          <h2 className="font-bold mb-2">Next/Image with unoptimized:</h2>
          <img 
            src="/placeholder-product.jpg" 
            alt="Placeholder" 
            className="w-64 h-64 object-cover border"
          />
        </div>
        
        <div>
          <h2 className="font-bold mb-2">Category Image:</h2>
          <img 
            src="/uploads/categories/cat-1756954910134.jpg" 
            alt="Category" 
            className="w-64 h-64 object-cover border"
          />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="font-bold">Debug Info:</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          NODE_ENV: {process.env.NODE_ENV}
        </pre>
      </div>
    </div>
  )
}
