"use client"
import { useEffect, useMemo, useState } from 'react'

export function ReviewsTabs({ productId, htmlDescription }: { productId: string, htmlDescription: string }) {
  const [tab, setTab] = useState<'description' | 'reviews'>('description')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number } | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchReviews = async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${productId}/reviews?page=${pageNum}&limit=15`, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch reviews')
      setReviews(json.data.reviews)
      setStats({ averageRating: json.data.stats.averageRating, totalReviews: json.data.stats.totalReviews })
      setHasMore(json.data.pagination.page * json.data.pagination.limit < json.data.pagination.total)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  // Fetch once on mount so tab counter is populated even when not viewing the Reviews tab
  useEffect(() => {
    void fetchReviews(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tab === 'reviews') {
      void fetchReviews(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page])

  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = useMemo(() => {
    return rating >= 1 && rating <= 5 && comment.trim().length > 0
  }, [rating, comment])

  const submitReview = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment, ...(title.trim()? { title: title.trim() } : {}) })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to submit')
      // update stats immediately from server response
      if (json.stats) setStats({ averageRating: json.stats.averageRating, totalReviews: json.stats.totalReviews })
      setTitle('')
      setComment('')
      setRating(5)
      // refresh
      void fetchReviews(1)
      setPage(1)
      setTab('reviews')
    } catch (e: any) {
      setError(e?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-12" data-reviews-tabs>
      <div className="flex space-x-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 -mb-px border-b-2 ${tab==='description' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'} hover:text-primary-600`}
          onClick={() => setTab('description')}
          data-tab="description"
        >
          Description
        </button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 ${tab==='reviews' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'} hover:text-primary-600`}
          onClick={() => setTab('reviews')}
          data-tab="reviews"
        >
          Reviews{(stats || reviews.length > 0) ? ` (${stats?.totalReviews ?? reviews.length})` : ''}
        </button>
      </div>

      {tab === 'description' && (
        <div className="mt-6">
          <div className="prose max-w-none text-gray-700 [ul]:list-disc [ul]:pl-6 [ol]:list-decimal [ol]:pl-6 [li]:my-1"
               dangerouslySetInnerHTML={{ __html: htmlDescription || '' }} />
        </div>
      )}

      {tab === 'reviews' && (
        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Rating</label>
                    <select value={rating} onChange={e => setRating(parseInt(e.target.value))} className="w-24 px-3 py-2 border border-gray-300 rounded-lg">
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Comment</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Share your experience" />
                  </div>
                </div>
                <div className="mt-3">
                  <button onClick={submitReview} disabled={!canSubmit || submitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={String(r._id)} className="border border-gray-200 rounded-lg p-6 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">
                              {r.user?.firstName || r.user?.name || r.customerName || 'Anonymous'}
                            </div>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < r.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {r.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        
                        {r.title && (
                          <div className="mb-2 font-medium text-gray-900">{r.title}</div>
                        )}
                        
                        <div className="text-gray-700 leading-relaxed">
                          {r.comment}
                        </div>
                        
                        {r.helpfulCount > 0 && (
                          <div className="mt-3 text-sm text-gray-500">
                            {r.helpfulCount} people found this helpful
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {hasMore && (
                  <div className="mt-4">
                    <button onClick={() => setPage(p => p+1)} className="px-4 py-2 border rounded-lg">Load more</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}


