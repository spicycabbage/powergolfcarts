'use client'

import { useState, useEffect, useMemo } from 'react'

export interface SeoData {
  title: string
  description: string
  keywords: string[]
}

interface SeoFieldsProps {
  seo: SeoData
  onChange: (seo: SeoData) => void
  titleLabel?: string
  descriptionLabel?: string
  keyphraseLabel?: string
  previewPath?: string // e.g. "/products/slug" or "/about"
  fallbackTitle?: string
  fallbackDescription?: string
}

export default function SeoFields({ seo, onChange, titleLabel = 'SEO Title', descriptionLabel = 'Meta Description', keyphraseLabel = 'Keyphrase', previewPath = '', fallbackTitle = '', fallbackDescription = '' }: SeoFieldsProps) {
  const [local, setLocal] = useState<SeoData>({ title: '', description: '', keywords: [] })
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')

  useEffect(() => {
    setLocal(seo || { title: '', description: '', keywords: [] })
  }, [seo])

  const setKeyphrase = (phrase: string) => {
    const next: SeoData = { ...local, keywords: [phrase] }
    setLocal(next)
    onChange(next)
  }

  const setTitle = (title: string) => {
    const next: SeoData = { ...local, title }
    setLocal(next)
    onChange(next)
  }

  const setDescription = (description: string) => {
    const next: SeoData = { ...local, description }
    setLocal(next)
    onChange(next)
  }

  const keyphrase = (local.keywords && local.keywords[0]) || ''

  const hostname = typeof window !== 'undefined' ? window.location.host : 'example.com'
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
  const displayTitle = (local.title || fallbackTitle || '').slice(0, 70)
  const displayDescription = (local.description || fallbackDescription || '').slice(0, 160)
  const titleLen = (local.title || '').length
  const descLen = (local.description || '').length

  const highlightDescription = useMemo(() => {
    if (!displayDescription || !keyphrase) return displayDescription
    try {
      const re = new RegExp(`(${keyphrase.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, 'ig')
      return displayDescription.replace(re, '<b>$1</b>')
    } catch {
      return displayDescription
    }
  }, [displayDescription, keyphrase])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{keyphraseLabel}</label>
        <input
          type="text"
          value={keyphrase}
          onChange={(e) => setKeyphrase(e.target.value)}
          placeholder="e.g., premium pink kush indica"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="mt-1 text-xs text-gray-500">Multiple words allowed (a phrase).</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{titleLabel}</label>
        <input
          type="text"
          value={local.title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <div className={`mt-1 text-xs ${titleLen > 70 ? 'text-red-600' : 'text-gray-500'}`}>{titleLen}/70 chars</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{descriptionLabel}</label>
        <textarea
          value={local.description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <div className={`mt-1 text-xs ${descLen > 160 ? 'text-red-600' : 'text-gray-500'}`}>{descLen}/160 chars</div>
      </div>

      {/* SERP Preview */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">Search appearance (preview)</div>
          <div className="space-x-2">
            <button type="button" onClick={() => setPreviewDevice('mobile')} className={`px-2 py-1 text-xs rounded border ${previewDevice==='mobile' ? 'bg-gray-100 border-gray-300' : 'border-transparent'}`}>Mobile</button>
            <button type="button" onClick={() => setPreviewDevice('desktop')} className={`px-2 py-1 text-xs rounded border ${previewDevice==='desktop' ? 'bg-gray-100 border-gray-300' : 'border-transparent'}`}>Desktop</button>
          </div>
        </div>
        <div className={`rounded-lg border ${previewDevice==='mobile' ? 'p-4' : 'p-5'} bg-white`}>
          <div className="text-xs text-[#1A0DAB]/60 mb-1">{hostname}</div>
          <div className="text-[#1A0DAB] text-lg leading-snug hover:underline line-clamp-2">{displayTitle || 'Preview Title'}</div>
          <div className="text-sm text-[#4d5156] mt-1" dangerouslySetInnerHTML={{ __html: highlightDescription || 'Preview of meta description will appear here.' }} />
        </div>
      </div>
    </div>
  )
}


