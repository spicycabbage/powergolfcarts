'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  limit?: number
  onChange: (nextPage: number) => void
  onLimitChange?: (newLimit: number) => void
}

export default function Pagination({ page, totalPages, total, limit = 20, onChange, onLimitChange }: PaginationProps) {
  const [inputPage, setInputPage] = useState('')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setInputPage(page.toString())
  }, [])

  // Update input when page changes
  useEffect(() => {
    if (mounted) {
      setInputPage(page.toString())
    }
  }, [page, mounted])

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPage = parseInt(inputPage)
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onChange(newPage)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  const handleInputBlur = () => {
    const newPage = parseInt(inputPage)
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onChange(newPage)
    } else {
      setInputPage(page.toString())
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-1 flex-wrap">
      {/* First Page Button */}
      <button
        disabled={page <= 1}
        onClick={() => onChange(1)}
        className={`p-1.5 rounded border ${
          page <= 1 
            ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title="First page"
      >
        <div className="flex items-center">
          <ChevronLeft className="w-3 h-3" />
          <ChevronLeft className="w-3 h-3 -ml-1" />
        </div>
      </button>

      {/* Previous Button */}
      <button
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={`px-2 py-1.5 text-xs rounded border ${
          page <= 1 
            ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Prev
      </button>

      {/* Page Input */}
      <div className="flex items-center space-x-1 text-xs text-gray-600">
        <span>Page:</span>
        <form onSubmit={handlePageSubmit} className="inline">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-10 px-1 py-1 text-center text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>
        <span>of {totalPages}</span>
      </div>

      {/* Next Button */}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className={`px-2 py-1.5 text-xs rounded border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 ${
          page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Next
      </button>

      {/* Items per page selector */}
      <select 
        value={limit}
        onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[60px]"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      {/* Total count */}
      {typeof total === 'number' && (
        <span className="text-xs text-gray-500 ml-2">• {total} total</span>
      )}
    </div>
  )
}


