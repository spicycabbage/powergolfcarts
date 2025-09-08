"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackToAdmin from '@/components/admin/BackToAdmin'
import HtmlEditor from '@/components/forms/HtmlEditor'
import SeoFields, { SeoData } from '@/components/seo/SeoFields'
import { Plus, Trash2 } from 'lucide-react'

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string>('')
  const [seo, setSeo] = useState<SeoData>({ title: '', description: '', keywords: [] })
  const [topic, setTopic] = useState<string>('')
  const [coverImage, setCoverImage] = useState<string>('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const normalizeContent = (html: string): string => {
    try {
      if (!html) return ''
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch && bodyMatch[1]) return bodyMatch[1]
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      if (articleMatch && articleMatch[1]) return articleMatch[1]
      return html.replace(/<\/?html[^>]*>/gi,'').replace(/<\/?head[^>]*>[\s\S]*?<\/?head>/gi,'')
    } catch { return html }
  }


  const toSlug = (s: string) => s
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
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
      description: prev.description || (excerpt || content.replace(/<[^>]*>/g,' ').trim().slice(0,160)),
      keywords: prev.keywords?.length ? prev.keywords : (title ? [title] : [])
    }))
  }, [title, excerpt, content, slugEdited])

  const canSave = useMemo(() => title.trim().length > 0 && slug.trim().length > 0, [title, slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, slug, excerpt, content: normalizeContent(content), coverImage, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), topic, seo, isPublished })
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to create post')
        return
      }
      router.push('/admin/blog')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">New Post</h1>
          <div className="flex items-center space-x-3">
            <BackToAdmin />
            <Link href="/admin/blog" className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200">Back to Blog</Link>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <HtmlEditor label="Content" value={content} onChange={setContent} rows={20} placeholder="Write post content (HTML supported)" />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">SEO</h2>
              <SeoFields seo={seo} onChange={setSeo} keyphraseLabel="Focus Keyphrase" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Feature Image Card */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Feature Image</label>
                <label className="inline-flex items-center px-2 py-1 bg-primary-600 text-white rounded cursor-pointer text-xs">
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const form = new FormData()
                    form.append('file', f)
                    const res = await fetch('/api/admin/posts/upload', { method: 'POST', body: form, credentials: 'include' })
                    if (!res.ok) { alert('Upload failed'); return }
                    const data = await res.json()
                    setCoverImage(data.url)
                  }} />
                  <Plus className="w-3 h-3 mr-1"/> Upload
                </label>
              </div>
              {coverImage ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Cover" className="w-full h-auto rounded" />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">{coverImage}</span>
                    <button type="button" className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={()=>setCoverImage('')}>
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No image selected.</p>
              )}
            </div>

            {/* Post Settings Card */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input value={tags} onChange={e=>setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (topic)</label>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. concentrates, flowers, vapes" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <p className="mt-1 text-xs text-gray-500">One topic only. Used for hubs/breadcrumbs.</p>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} className="h-4 w-4 text-primary-600" />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <div className="pt-2">
                <button disabled={!canSave || saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}


