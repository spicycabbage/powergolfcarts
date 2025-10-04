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
  const suppressChangeRef = useRef<boolean>(false)
  const isTypingRef = useRef<boolean>(false)

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

  // Clean editor output: remove empty paragraphs, stray &nbsp;, and redundant breaks
  const cleanEditorHtml = (html: string): string => {
    try {
      if (!html) return ''
      let out = html
      // Remove script/style blocks entirely
      out = out.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
               .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove empty paragraphs like <p><br></p>, <p>&nbsp;</p>, or <p>   </p>
      out = out.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>(?:\s|&nbsp;)*)*<\/p>/gi, '')
      // Collapse multiple blank lines
      out = out.replace(/(\n|\r){2,}/g, '\n')
      // Trim whitespace
      out = out.trim()
      return out
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
          history: { userOnly: true },
        },
      })
      // Match textarea (Code) font sizing
      try {
        quillRef.current.root.style.fontSize = '1rem'
        quillRef.current.root.style.lineHeight = '1.5'
      } catch {}
      // Set initial HTML (normalized)
      if (typeof value === 'string') {
        suppressChangeRef.current = true
        const html = cleanEditorHtml(extractInnerContent(value))
        try { quillRef.current.clipboard.dangerouslyPasteHTML(0, html, 'silent') } catch { quillRef.current.root.innerHTML = html }
        // Allow one microtask for DOM to settle, then re-enable
        setTimeout(() => { suppressChangeRef.current = false }, 0)
      }
      quillRef.current.on('text-change', () => {
        if (suppressChangeRef.current) return
        isTypingRef.current = true
        const html: string = quillRef.current.root.innerHTML || ''
        onChange(cleanEditorHtml(html))
        // Reset typing flag after a short delay to allow for external updates
        setTimeout(() => { isTypingRef.current = false }, 100)
      })
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Sync external value into editor when it changes (and differs)
  useEffect(() => {
    if (mode !== 'visual') return
    // Don't sync if user is actively typing (prevents cursor reset)
    if (isTypingRef.current) return
    if (quillRef.current && typeof value === 'string') {
      const currentHtml: string = quillRef.current.root.innerHTML || ''
      const cleanedValue = cleanEditorHtml(extractInnerContent(value))
      const cleanedCurrent = cleanEditorHtml(currentHtml)
      // Only sync if the cleaned versions differ significantly (avoid cursor resets during typing)
      if (cleanedValue !== cleanedCurrent) {
        suppressChangeRef.current = true
        quillRef.current.root.innerHTML = cleanedValue
        setTimeout(() => { suppressChangeRef.current = false }, 0)
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
            className={`px-3 py-1 text-xs ${mode === 'visual' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setMode('visual')}
          >
            Visual
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs border-l border-gray-300 ${mode === 'code' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
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
          onChange={e => onChange(cleanEditorHtml(e.target.value))}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required={required}
        />
      )}
    </div>
  )
}


