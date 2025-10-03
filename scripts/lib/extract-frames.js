const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const cheerio = require('cheerio')
const ffmpegPath = require('ffmpeg-static')
const ffprobePath = require('ffprobe-static').path
const ffmpeg = require('fluent-ffmpeg')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest)
  const response = await axios({ url, method: 'GET', responseType: 'stream' })
  response.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function findFirstVideoUrl(pageUrl) {
  const { data } = await axios.get(pageUrl, { timeout: 20000 })
  const $ = cheerio.load(data)
  // Try common selectors: <video src>, <source>, and Shopify sections
  let src = $('video').attr('src') || $('video source').attr('src')
  if (!src) {
    // Look for data attributes that might hold the URL
    const candidate = $('[data-video], [data-section], [data-media-id] source').attr('src')
    if (candidate) src = candidate
  }
  if (src && src.startsWith('//')) src = 'https:' + src
  return src || null
}

async function extractKeyframes(inputPath, outDir) {
  await fs.ensureDir(outDir)
  // Extract 6 frames evenly spread across the duration
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err)
      const duration = metadata?.format?.duration || 60
      const count = 6
      const timestamps = Array.from({ length: count }, (_, i) => Math.max(0, Math.floor((duration * (i + 1)) / (count + 1))))
      let idx = 0
      const outputs = []
      ;(function next() {
        if (idx >= timestamps.length) return resolve(outputs)
        const ts = timestamps[idx++]
        const filename = path.join(outDir, `frame-${String(idx).padStart(2, '0')}.jpg`)
        ffmpeg(inputPath)
          .outputOptions(['-frames:v 1'])
          .seekInput(ts)
          .output(filename)
          .on('end', () => { outputs.push(filename); next() })
          .on('error', reject)
          .run()
      })()
    })
  })
}

async function main() {
  const pageUrl = process.argv[2]
  if (!pageUrl) {
    console.error('Usage: node scripts/lib/extract-frames.js <product_url>')
    process.exit(1)
  }

  const tmpDir = path.join(__dirname, '..', '..', 'temp_extract')
  const outDir = path.join(__dirname, '..', '..', 'public', 'robera')
  await fs.ensureDir(tmpDir)
  await fs.ensureDir(outDir)

  console.log('Fetching video from:', pageUrl)
  const videoUrl = await findFirstVideoUrl(pageUrl)
  if (!videoUrl) {
    console.error('No video URL found on page')
    process.exit(2)
  }

  const videoPath = path.join(tmpDir, 'source.mp4')
  console.log('Downloading video...')
  await downloadFile(videoUrl, videoPath)
  console.log('Extracting frames...')
  const files = await extractKeyframes(videoPath, outDir)
  console.log('Frames saved:', files)
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1) })
}

module.exports = { extractKeyframes, findFirstVideoUrl }


