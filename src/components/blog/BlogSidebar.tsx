import Link from 'next/link'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

export default async function BlogSidebar({ activeTag }: { activeTag?: string }) {
  await connectToDatabase()

  const [recent, tagsAgg] = await Promise.all([
    Post.find({ isPublished: true })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .limit(6)
      .select('title slug coverImage publishedAt')
      .lean(),
    Post.aggregate([
      { $match: { isPublished: true, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: { $toLower: '$tags' }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 }
    ])
  ])

  const tags = tagsAgg.map((t: any) => ({ tag: String(t._id), count: Number(t.count) }))

  return (
    <aside className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
        <ul className="space-y-4">
          {recent.map((p: any) => (
            <li key={String(p._id)} className="flex items-start gap-3">
              {p.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt={p.title} className="w-14 h-14 rounded object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="min-w-0">
                <Link href={`/blog/${p.slug}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                  {p.title}
                </Link>
                <div className="text-xs text-gray-500">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-600">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`text-xs px-2 py-1 rounded border ${activeTag === tag ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                prefetch={false}
                title={`${count} post${count === 1 ? '' : 's'}`}
              >
                {tag} ({count})
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  )
}



