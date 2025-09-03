'use client'

interface JsonLdProps {
  data: object | object[]
}

export default function JsonLd({ data }: JsonLdProps) {
  const json = Array.isArray(data) ? data : [data]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json.length === 1 ? json[0] : json) }}
    />
  )
}


