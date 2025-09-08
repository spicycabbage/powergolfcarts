import Link from 'next/link'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function queryPostsByTags(allTags: string[]) {
  if (!allTags || allTags.length === 0) return [] as any[]
  const normalized = Array.from(new Set(
    allTags
      .map(t => String(t || '').trim())
      .filter(Boolean)
      .flatMap(t => [t, t.toLowerCase(), t.replace(/\s+strain$/i, '').trim(), `${t} strain`])
      .map(t => t.trim())
      .filter(Boolean)
  ))

  if (normalized.length === 0) return [] as any[]

  await connectToDatabase()

  // Build OR of regex exact-match (case-insensitive) for each candidate
  const orClauses = normalized.map(t => ({
    tags: { $elemMatch: { $regex: `^${escapeRegExp(t)}$`, $options: 'i' } }
  }))

  const items = await Post.find({ isPublished: true, $or: orClauses })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(2)
    .lean()
    .catch(() => [])

  return Array.isArray(items) ? items : []
}

export default async function LearnMore({ tags = [] as string[] }) {
  const posts = await queryPostsByTags(tags)
  if (!posts.length) return null as any
  return (
    <aside className="prose mt-8">
      <h2>Learn more</h2>
      <ul>
        {posts.map((p: any) => (
          <li key={String(p.slug || p._id)}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>
        ))}
      </ul>
    </aside>
  )
}


