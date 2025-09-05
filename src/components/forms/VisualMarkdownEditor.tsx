"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import TurndownService from 'turndown'
import { marked } from 'marked'
import 'quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any

type Props = {
  markdown: string
  onMarkdownChange: (next: string) => void
  minHeight?: number
}

export default function VisualMarkdownEditor({ markdown, onMarkdownChange, minHeight = 240 }: Props) {
  const turndown = useMemo(() => new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' }), [])

  const html = useMemo(() => {
    try {
      return marked(markdown || '')
    } catch {
      return markdown || ''
    }
  }, [markdown])

  return (
    <ReactQuill
      theme="snow"
      defaultValue={html as any}
      onChange={(content: string) => {
        try {
          const md = turndown.turndown(content || '')
          onMarkdownChange(md)
        } catch {
          // fallback: keep previous
        }
      }}
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean'],
        ],
      }}
      style={{ minHeight }}
    />
  )
}


