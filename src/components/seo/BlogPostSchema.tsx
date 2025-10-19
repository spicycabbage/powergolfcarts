import JsonLd from './JsonLd'

interface BlogPostSchemaProps {
  title: string
  excerpt?: string
  content: string
  coverImage?: string
  publishedAt: string
  slug: string
  tags?: string[]
  topic?: string
}

export default function BlogPostSchema({
  title,
  excerpt,
  content,
  coverImage,
  publishedAt,
  slug,
  tags,
  topic
}: BlogPostSchemaProps) {
  // Strip HTML from content for description
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  const baseUrl = 'https://www.powergolfcarts.shop'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt || stripHtml(content).substring(0, 160),
    image: coverImage ? (coverImage.startsWith('http') ? coverImage : `${baseUrl}${coverImage}`) : undefined,
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: new Date(publishedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Power Golf Carts',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Power Golf Carts',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`
    },
    keywords: tags?.join(', '),
    articleSection: topic,
    inLanguage: 'en-US'
  }

  // Remove undefined fields
  Object.keys(schema).forEach(key => 
    schema[key as keyof typeof schema] === undefined && delete schema[key as keyof typeof schema]
  )

  return <JsonLd data={schema} />
}


