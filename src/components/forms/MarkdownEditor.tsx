"use client"

import React, { useState } from 'react'
import MarkdownPreview from '@/components/MarkdownPreview'

type Props = {
  label: string
  value: string
  onChange: (next: string) => void
  rows?: number
  required?: boolean
  placeholder?: string
}

export default function MarkdownEditor({ label, value, onChange, rows = 8, required, placeholder }: Props) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}{required ? ' *' : ''}
        </label>
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          <button
            type="button"
            className={`px-3 py-1 text-xs ${mode === 'visual' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setMode('visual')}
          >
            Visual
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs border-l border-gray-300 ${mode === 'code' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setMode('code')}
          >
            Code
          </button>
        </div>
      </div>
      {mode === 'visual' ? (
        <div className="min-h-[120px] rounded-lg border border-gray-300 p-3 bg-white">
          {value && value.trim() !== '' ? (
            <MarkdownPreview value={value} />
          ) : (
            <div className="text-sm text-gray-500">Nothing to preview. Switch to Code to enter Markdown.</div>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required={required}
        />
      )}
    </div>
  )
}


