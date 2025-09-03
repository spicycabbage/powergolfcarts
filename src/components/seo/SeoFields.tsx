'use client'

import { useState, useEffect } from 'react'

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
}

export default function SeoFields({ seo, onChange, titleLabel = 'SEO Title', descriptionLabel = 'Meta Description', keyphraseLabel = 'Keyphrase' }: SeoFieldsProps) {
  const [local, setLocal] = useState<SeoData>({ title: '', description: '', keywords: [] })

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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{descriptionLabel}</label>
        <textarea
          value={local.description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  )
}


