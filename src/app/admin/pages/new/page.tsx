"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackToAdmin from '@/components/admin/BackToAdmin'
import HtmlEditor from '@/components/forms/HtmlEditor'
import SeoFields, { SeoData } from '@/components/seo/SeoFields'

export default function NewPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [content, setContent] = useState('')
  const [seo, setSeo] = useState<SeoData>({ title: '', description: '', keywords: [] })
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const toSlug = (s: string) => s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g,'')
    .replace(/_/g,'-')
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-')
    .replace(/^-+|-+$/g,'')

  useEffect(() => {
    if (!slugEdited) {
      const next = toSlug(title)
      if (title && next && next !== slug) setSlug(next)
    }
    setSeo(prev => ({
      title: prev.title || title,
      description: prev.description || content.replace(/<[^>]*>/g,' ').trim().slice(0,160),
      keywords: prev.keywords?.length ? prev.keywords : (title ? [title] : [])
    }))
  }, [title, content, slugEdited])

  const canSave = useMemo(() => title.trim().length > 0 && slug.trim().length > 0, [title, slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, slug, content, seo, isPublished })
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to create page')
        return
      }
      router.push('/admin/pages')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">New Page</h1>
          <div className="flex items-center space-x-3">
            <BackToAdmin />
            <Link href="/admin/pages" className="text-sm text-gray-600 hover:text-gray-900">Back to Pages</Link>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input value={slug} onChange={e=>{setSlug(e.target.value); if(!slugEdited) setSlugEdited(true)}} onBlur={e=>setSlug(toSlug(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <HtmlEditor label="Content" value={content} onChange={setContent} rows={20} placeholder="Write page content (HTML supported)" />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">SEO</h2>
              <SeoFields seo={seo} onChange={setSeo} keyphraseLabel="Focus Keyphrase" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} className="h-4 w-4 text-primary-600" />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <div className="pt-2">
                <button disabled={!canSave || saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}


