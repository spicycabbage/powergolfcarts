const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Configuration
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads')
const OPTIMIZED_DIR = path.join(__dirname, '..', 'public', 'optimized')

// Image sizes for responsive images
const SIZES = {
  thumbnail: 150,
  small: 300,
  medium: 600,
  large: 1200,
  xlarge: 1920
}

// Quality settings
const WEBP_QUALITY = 85
const JPEG_QUALITY = 90

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      originalSize: 0,
      optimizedSize: 0,
      skipped: 0
    }
  }

  async init() {
    // Create optimized directory structure
    await this.ensureDir(OPTIMIZED_DIR)
    await this.ensureDir(path.join(OPTIMIZED_DIR, 'products'))
    await this.ensureDir(path.join(OPTIMIZED_DIR, 'categories'))
    await this.ensureDir(path.join(OPTIMIZED_DIR, 'posts'))
    
    console.log('🚀 Starting image optimization...')
    console.log(`📁 Source: ${UPLOAD_DIR}`)
    console.log(`📁 Output: ${OPTIMIZED_DIR}`)
  }

  async ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
  }

  getOutputPath(inputPath, size, format = 'webp') {
    const relativePath = path.relative(UPLOAD_DIR, inputPath)
    const parsedPath = path.parse(relativePath)
    const sizePrefix = size === 'original' ? '' : `_${size}`
    const newName = `${parsedPath.name}${sizePrefix}.${format}`
    return path.join(OPTIMIZED_DIR, parsedPath.dir, newName)
  }

  async optimizeImage(inputPath, outputPath, width, quality = WEBP_QUALITY) {
    try {
      const image = sharp(inputPath)
      const metadata = await image.metadata()
      
      // Don't upscale images
      const targetWidth = width && width < metadata.width ? width : metadata.width
      
      await image
        .resize(targetWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality })
        .toFile(outputPath)

      return true
    } catch (error) {
      console.error(`❌ Error optimizing ${inputPath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  async processImage(inputPath) {
    try {
      const stats = fs.statSync(inputPath)
      this.stats.originalSize += stats.size

      console.log(`📸 Processing: ${path.basename(inputPath)}`)

      // Generate WebP versions in multiple sizes
      const tasks = []
      
      // Original size WebP
      const originalOutput = this.getOutputPath(inputPath, 'original', 'webp')
      tasks.push(this.optimizeImage(inputPath, originalOutput, null))

      // Responsive sizes
      for (const [sizeName, width] of Object.entries(SIZES)) {
        const sizeOutput = this.getOutputPath(inputPath, sizeName, 'webp')
        tasks.push(this.optimizeImage(inputPath, sizeOutput, width))
      }

      // Also create a high-quality JPEG fallback
      const jpegOutput = this.getOutputPath(inputPath, 'original', 'jpg')
      tasks.push(this.optimizeJpeg(inputPath, jpegOutput))

      await Promise.all(tasks)

      // Calculate optimized size (just the original WebP for stats)
      if (fs.existsSync(originalOutput)) {
        const optimizedStats = fs.statSync(originalOutput)
        this.stats.optimizedSize += optimizedStats.size
      }

      this.stats.processed++
      
    } catch (error) {
      console.error(`❌ Error processing ${inputPath}:`, error.message)
      this.stats.errors++
    }
  }

  async optimizeJpeg(inputPath, outputPath, quality = JPEG_QUALITY) {
    try {
      await sharp(inputPath)
        .jpeg({ quality, progressive: true })
        .toFile(outputPath)
      return true
    } catch (error) {
      console.error(`❌ Error creating JPEG ${inputPath}:`, error.message)
      return false
    }
  }

  async processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath)
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        await this.processDirectory(itemPath)
      } else if (this.isImageFile(item)) {
        await this.processImage(itemPath)
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  printStats() {
    const savings = this.stats.originalSize - this.stats.optimizedSize
    const savingsPercent = this.stats.originalSize > 0 
      ? ((savings / this.stats.originalSize) * 100).toFixed(1)
      : 0

    console.log('\n🎉 Optimization Complete!')
    console.log('═'.repeat(50))
    console.log(`📊 Images processed: ${this.stats.processed}`)
    console.log(`❌ Errors: ${this.stats.errors}`)
    console.log(`📏 Original size: ${this.formatBytes(this.stats.originalSize)}`)
    console.log(`📦 Optimized size: ${this.formatBytes(this.stats.optimizedSize)}`)
    console.log(`💾 Space saved: ${this.formatBytes(savings)} (${savingsPercent}%)`)
    console.log('═'.repeat(50))
  }

  async run() {
    await this.init()
    
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.error(`❌ Upload directory not found: ${UPLOAD_DIR}`)
      return
    }

    await this.processDirectory(UPLOAD_DIR)
    this.printStats()

    console.log('\n📝 Next steps:')
    console.log('1. Update your image components to use optimized images')
    console.log('2. Configure Next.js for WebP support')
    console.log('3. Test image loading on your site')
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new ImageOptimizer()
  optimizer.run().catch(console.error)
}

module.exports = ImageOptimizer
