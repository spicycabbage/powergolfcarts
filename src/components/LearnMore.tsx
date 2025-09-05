import Link from 'next/link'

async function fetchRelatedByTag(tag: string) {
  try {
    const res = await fetch(`/api/blog?tag=${encodeURIComponent(tag)}`, { cache: 'no-store' as any })
    const json = await res.json().catch(() => ({}))
    return Array.isArray(json?.data) ? json.data.slice(0, 2) : []
  } catch {
    return []
  }
}

export default async function LearnMore({ tags = [] as string[] }) {
  const primary = tags[0]
  if (!primary) return null as any
  const posts = await fetchRelatedByTag(primary)
  if (!posts.length) return null as any
  return (
    <aside className="prose mt-8">
      <h2>Learn more</h2>
      <ul>
        {posts.map((p: any) => (
          <li key={p.slug}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>
        ))}
      </ul>
    </aside>
  )
}


