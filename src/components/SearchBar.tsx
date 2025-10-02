'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose()
        setShowResults(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          limit: '8',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        const response = await fetch(`/api/products?${params}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setResults(result.data || [])
            setShowResults(true)
          }
        }
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleResultClick = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    onClose()
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-4 md:pt-20">
      <div 
        ref={searchRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for golf cart products..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 text-sm">Searching...</p>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-3">
                No products found for "{query}"
              </div>
              <div className="space-x-3">
                <Link
                  href="/categories/electric-carts"
                  onClick={handleResultClick}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Browse E-Carts
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  href="/categories/robera"
                  onClick={handleResultClick}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Browse Robera
                </Link>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  onClick={handleResultClick}
                  className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-gray-900 hover:text-primary-600 font-medium"
                >
                  {product.name}
                </Link>
              ))}
              
              {results.length >= 8 && (
                <div className="p-3 text-center bg-gray-50 border-t">
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View all results for "{query}" →
                  </Link>
                </div>
              )}
            </div>
          )}

          {query.length < 2 && query.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
