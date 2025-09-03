'use client'

import JsonLd from './JsonLd'

export interface Crumb {
  name: string
  item: string
}

interface BreadcrumbsJsonLdProps {
  crumbs: Crumb[]
}

export default function BreadcrumbsJsonLd({ crumbs }: BreadcrumbsJsonLdProps) {
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null

  const itemListElement = crumbs.map((c, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: c.name,
    item: c.item,
  }))

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      }}
    />
  )
}


