export function normalizeImageUrl(image: any): string {
  const url = typeof image === 'string' ? image : (image && typeof image === 'object' ? String(image.url || '') : '')
  if (!url) return ''
  if (url.startsWith('data:')) return url
  if (/^https?:\/\//i.test(url)) return url
  // Strip leading public/ if present
  const cleaned = url.replace(/^public\//, '')
  if (cleaned.startsWith('/')) return cleaned
  // If looks like an uploads path without leading slash
  if (/^uploads\//i.test(cleaned)) return `/${cleaned}`
  // If it's just a bare filename, assume products folder
  if (/^[A-Za-z0-9_.-]+$/i.test(cleaned)) return `/uploads/products/${cleaned}`
  return `/${cleaned}`
}


