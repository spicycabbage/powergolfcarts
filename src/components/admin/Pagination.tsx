'use client'

import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  onChange: (nextPage: number) => void
}

export default function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}{typeof total === 'number' ? ` • ${total} total` : ''}
      </div>
      <div className="inline-flex items-center space-x-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className={`px-3 py-2 text-sm rounded-lg border ${page <= 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Prev
        </button>
        <div className="hidden sm:flex items-center space-x-1">
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, idx) => {
            const pageNum = idx + 1
            return (
              <button
                key={pageNum}
                onClick={() => onChange(pageNum)}
                className={`px-3 py-2 text-sm rounded-lg border ${page === pageNum ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className={`px-3 py-2 text-sm rounded-lg border ${page >= totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Next
        </button>
      </div>
    </div>
  )
}


