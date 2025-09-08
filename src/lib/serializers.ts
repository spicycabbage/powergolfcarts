export function serializeProductForClient(p: any) {
  if (!p) return null
  const name = String(p.name || '')
  const images = Array.isArray(p.images)
    ? p.images.map((img: any, idx: number) => ({
        _id: String((img && img._id) || `${idx}`),
        url: String(typeof img === 'string' ? img : img?.url || ''),
        alt: String(typeof img === 'string' ? name : img?.alt || name),
        width: Number(typeof img === 'string' ? 800 : img?.width || 800),
        height: Number(typeof img === 'string' ? 800 : img?.height || 800),
        isPrimary: Boolean(typeof img === 'string' ? idx === 0 : img?.isPrimary)
      }))
    : []

  const toCat = (c: any) => ({ _id: String(c?._id || c), name: String(c?.name || ''), slug: String(c?.slug || '') })

  return {
    _id: String(p._id || ''),
    name,
    slug: String(p.slug || ''),
    description: String(p.description || ''),
    shortDescription: String(p.shortDescription || ''),
    price: Number(p.price ?? 0),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    images,
    category: p.category ? toCat(p.category) : undefined,
    categories: Array.isArray(p.categories) ? p.categories.map(toCat) : [],
    tags: Array.isArray(p.tags) ? p.tags.map((t: any) => String(t)) : [],
    inventory: {
      quantity: Number(p.inventory?.quantity || 0),
      lowStockThreshold: Number(p.inventory?.lowStockThreshold || 5),
      sku: String(p.inventory?.sku || ''),
      trackInventory: Boolean(p.inventory?.trackInventory ?? true)
    },
    seo: {
      title: String(p.seo?.title || ''),
      description: String(p.seo?.description || ''),
      keywords: Array.isArray(p.seo?.keywords) ? p.seo.keywords.map((k: any) => String(k)) : []
    },
    variants: Array.isArray(p.variants)
      ? p.variants.map((v: any, i: number) => ({
          _id: String(v?._id || i),
          name: String(v?.name || ''),
          value: String(v?.value || ''),
          originalPrice: v?.originalPrice != null ? Number(v.originalPrice) : undefined,
          price: v?.price != null ? Number(v.price) : undefined,
          inventory: Number(v?.inventory || 0),
          sku: String(v?.sku || '')
        }))
      : [],
    reviews: [],
    averageRating: Number(p.averageRating || 0),
    reviewCount: Number(p.reviewCount || 0),
    isActive: Boolean(p.isActive),
    isFeatured: Boolean(p.isFeatured),
    createdAt: new Date(p.createdAt || Date.now()),
    updatedAt: new Date(p.updatedAt || Date.now())
  }
}


