"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'quill/dist/quill.snow.css'

type Props = {
  label: string
  value: string
  onChange: (next: string) => void
  rows?: number
  required?: boolean
  placeholder?: string
}

export default function HtmlEditor({ label, value, onChange, rows = 12, required, placeholder }: Props) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')

  const editorRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<any>(null)

  const toolbarOptions = useMemo(() => ([
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ]), [])

  // Normalize incoming HTML so Quill can render content even if a full document was pasted
  const extractInnerContent = (html: string): string => {
    try {
      if (!html) return ''
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch && bodyMatch[1]) return bodyMatch[1]
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      if (articleMatch && articleMatch[1]) return articleMatch[1]
      // Strip html/head wrappers if present
      return html.replace(/<\/?html[^>]*>/gi,'').replace(/<\/?head[^>]*>[\s\S]*?<\/?head>/gi,'')
    } catch {
      return html
    }
  }

  useEffect(() => {
    if (mode !== 'visual') return
    if (quillRef.current) return
    let mounted = true
    ;(async () => {
      const Quill = (await import('quill')).default
      if (!mounted || !editorRef.current) return
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions,
        },
      })
      // Match textarea (Code) font sizing
      try {
        quillRef.current.root.style.fontSize = '1rem'
        quillRef.current.root.style.lineHeight = '1.5'
      } catch {}
      // Set initial HTML (normalized)
      if (typeof value === 'string' && value.length > 0) {
        quillRef.current.root.innerHTML = extractInnerContent(value)
      }
      quillRef.current.on('text-change', () => {
        const html: string = quillRef.current.root.innerHTML || ''
        onChange(html)
      })
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Sync external value into editor when it changes (and differs)
  useEffect(() => {
    if (mode !== 'visual') return
    if (quillRef.current && typeof value === 'string') {
      const currentHtml: string = quillRef.current.root.innerHTML || ''
      if (value !== currentHtml) {
        quillRef.current.root.innerHTML = extractInnerContent(value)
      }
    }
  }, [value, mode])

  // Tear down reference when leaving visual mode so we recreate cleanly
  useEffect(() => {
    if (mode === 'code' && quillRef.current) {
      quillRef.current = null
    }
  }, [mode])

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
        <div className="rounded-lg border border-gray-300 bg-white">
          <div ref={editorRef} className="ql-container ql-snow" style={{ minHeight: rows * 10 + 120 }} />
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


