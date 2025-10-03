const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const cheerio = require('cheerio')
const { URL } = require('url')

function toAbsolute(base, maybeUrl) {
  try {
    if (!maybeUrl) return null
    if (maybeUrl.startsWith('//')) return 'https:' + maybeUrl
    if (maybeUrl.startsWith('http')) return maybeUrl
    return new URL(maybeUrl, base).toString()
  } catch {
    return null
  }
}

async function headSize(url) {
  try {
    const res = await axios.head(url, { timeout: 15000 })
    const len = Number(res.headers['content-length'] || 0)
    return len
  } catch {
    return 0
  }
}

async function download(url, dest) {
  const writer = fs.createWriteStream(dest)
  const res = await axios({ url, method: 'GET', responseType: 'stream', timeout: 60000 })
  res.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function scrapeImages(pageUrl) {
  const { data } = await axios.get(pageUrl, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } })
  const $ = cheerio.load(data)

  const urls = new Set()

  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    const srcset = $(el).attr('srcset') || ''
    const candidates = []
    if (src) candidates.push(src)
    if (srcset) srcset.split(',').forEach(p => candidates.push(p.trim().split(' ')[0]))
    for (const c of candidates) {
      const abs = toAbsolute(pageUrl, c)
      if (!abs) continue
      if (abs.startsWith('data:')) continue
      // Prefer product CDN assets
      urls.add(abs)
    }
  })

  // Basic filter: include jpeg/jpg/webp/png only
  const filtered = Array.from(urls).filter(u => /(\.jpe?g|\.webp|\.png)(\?|$)/i.test(u))
  // Prefer larger assets by picking the longest URL (often includes width hints) – quick heuristic
  filtered.sort((a, b) => b.length - a.length)
  return filtered
}

async function main() {
  const pageUrl = process.argv[2]
  const outDir = path.join(__dirname, '..', '..', 'public', 'robera')
  if (!pageUrl) {
    console.error('Usage: node scripts/lib/download-images.js <product_url>')
    process.exit(1)
  }
  await fs.ensureDir(outDir)

  console.log('Scraping images from:', pageUrl)
  const candidates = await scrapeImages(pageUrl)
  if (!candidates.length) {
    console.error('No images found')
    process.exit(2)
  }

  // Check sizes and pick top N meaningful images
  const sized = []
  for (const u of candidates.slice(0, 40)) {
    const size = await headSize(u)
    sized.push({ url: u, size })
  }
  sized.sort((a, b) => b.size - a.size)

  const pick = sized.filter(x => x.size >= 20_000).slice(0, 12) // >=20KB, top 12
  if (!pick.length) {
    console.warn('Images were found but appear small; proceeding with first 6 anyway')
    pick.push(...sized.slice(0, 6))
  }

  const manifest = []
  let idx = 1
  for (const item of pick) {
    const ext = (item.url.match(/\.(jpe?g|png|webp)(\?|$)/i) || [,'jpg'])[1].toLowerCase()
    const name = `robera-${String(idx++).padStart(2, '0')}.${ext}`
    const dest = path.join(outDir, name)
    console.log('Downloading', item.url, '->', name)
    try {
      await download(item.url, dest)
      manifest.push({ src: `/robera/${name}`, alt: 'Robera Pro', caption: '' })
    } catch (e) {
      console.warn('Failed:', item.url, e?.message)
    }
  }

  const manifestPath = path.join(outDir, 'manifest.json')
  await fs.writeJson(manifestPath, { images: manifest }, { spaces: 2 })
  console.log('Saved manifest:', manifestPath)
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1) })
}

module.exports = { scrapeImages }


