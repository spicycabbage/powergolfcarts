'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Upload, 
  Download, 
  FileText, 
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  imported: number
  errors: string[]
}

export default function ProductImport() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
      return
    }

    if (user?.role === 'admin') {
      fetchCategories()
    }
  }, [user, isLoading, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Import failed:', error)
      setResult({
        success: false,
        message: 'Import failed due to network error',
        imported: 0,
        errors: ['Network error occurred']
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `name,description,price,category,sku,stock,images,isActive
"Sample Product","This is a sample product description",29.99,"electronics","SKU001",100,"https://example.com/image1.jpg,https://example.com/image2.jpg",true
"Another Product","Another sample product",49.99,"clothing","SKU002",50,"https://example.com/image3.jpg",true`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Upload className="w-6 h-6 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Product Import</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/navigation')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Import Instructions</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Upload a CSV file with product data</li>
                <li>• Make sure categories exist before importing products</li>
                <li>• Required fields: name, price, category</li>
                <li>• Images should be comma-separated URLs</li>
                <li>• Download the template below for the correct format</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">CSV Template</h3>
              <p className="text-gray-600">Download the template to see the required format</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Categories Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Categories</h3>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No categories found. Create categories first before importing products.</p>
              <button
                onClick={() => router.push('/admin/categories')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Manage Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.filter(cat => !cat.parent).map(category => (
                <div key={category._id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">/{category.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Products</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {file ? (
              <div className="space-y-4">
                <p className="text-gray-900 font-medium">{file.name}</p>
                <p className="text-sm text-gray-600">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setFile(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || categories.length === 0}
                    className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Import Products'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Choose a CSV file to upload</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer inline-flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Import Results */}
        {result && (
          <div className={`rounded-lg shadow p-6 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {result.success ? (
                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              ) : (
                <X className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-medium mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  Import {result.success ? 'Successful' : 'Failed'}
                </h3>
                <p className={`mb-4 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                
                {result.success && (
                  <p className="text-green-800 font-medium">
                    Successfully imported {result.imported} products
                  </p>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


