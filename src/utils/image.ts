export function normalizeImageUrl(image: any): string {
  const url = typeof image === 'string' ? image : (image && typeof image === 'object' ? String(image.url || '') : '')
  if (!url) return ''
  if (url.startsWith('data:')) return url
  if (/^https?:\/\//i.test(url)) return url
  return url.startsWith('/') ? url : `/${url}`
}


