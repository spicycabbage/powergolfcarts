function normalize(s) {
  return (s || '').toString().toLowerCase()
}

function detectVariantProfile(categories) {
  // categories: array of { name, slug }
  const tokens = new Set()
  for (const c of categories || []) {
    const s = `${normalize(c.slug)} ${normalize(c.name)}`
    if (s.includes('flower') || s.includes('hash')) tokens.add('flower_hash')
    if (s.includes('shatter') || s.includes('diamond')) tokens.add('shatter_diamonds')
    if (s.includes('edible') || s.includes('gummies') || s.includes('chocolate')) tokens.add('edibles')
  }
  if (tokens.has('edibles')) return 'edibles'
  if (tokens.has('shatter_diamonds')) return 'shatter_diamonds'
  if (tokens.has('flower_hash')) return 'flower_hash'
  return null
}

function desiredWeightsFor(profile) {
  if (profile === 'flower_hash') return ['3.5g', '7g', '14g', '28g']
  if (profile === 'shatter_diamonds') return ['1g', '7g', '14g', '28g']
  return []
}

function buildVariants(profile, product) {
  if (profile === 'edibles') return []
  const weights = desiredWeightsFor(profile)
  const baseSku = `SKU-${(product.slug || product.name || product._id).toString().replace(/[^a-z0-9]+/gi, '-').toUpperCase()}`
  return weights.map(w => ({
    name: 'Weight',
    value: w,
    price: undefined,
    inventory: 0,
    sku: `${baseSku}-${w.replace(/\./g, '_').toUpperCase()}`
  }))
}

module.exports = {
  detectVariantProfile,
  desiredWeightsFor,
  buildVariants,
}


