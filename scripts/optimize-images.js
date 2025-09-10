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
    console.log('🚀 Image optimization started...')
  }

  async ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`📁 Created directory: ${dir}`)
    }
  }

  // Preserve original filename for SEO
  getOptimizedPath(inputPath, size = 'original', format = 'webp') {
    const relativePath = path.relative(UPLOAD_DIR, inputPath)
    const parsedPath = path.parse(relativePath)
    
    // Keep the original directory structure
    const dir = parsedPath.dir
    const name = parsedPath.name
    
    // Create size suffix only for non-original sizes
    const sizeSuffix = size === 'original' ? '' : `_${size}`
    const optimizedName = `${name}${sizeSuffix}.${format}`
    
    const outputDir = path.join(OPTIMIZED_DIR, dir)
    return {
      outputPath: path.join(outputDir, optimizedName),
      outputDir: outputDir
    }
  }

  async optimizeImage(inputPath, outputPath, width = null, quality = WEBP_QUALITY) {
    try {
      const outputDir = path.dirname(outputPath)
      await this.ensureDir(outputDir)

      let pipeline = sharp(inputPath)

      if (width) {
        pipeline = pipeline.resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
      }

      await pipeline
        .webp({ quality })
        .toFile(outputPath)

      return true
    } catch (error) {
      console.error(`❌ Error optimizing ${inputPath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  async optimizeJpeg(inputPath, outputPath, quality = JPEG_QUALITY) {
    try {
      const outputDir = path.dirname(outputPath)
      await this.ensureDir(outputDir)

      await sharp(inputPath)
        .jpeg({ quality, progressive: true })
        .toFile(outputPath)

      return true
    } catch (error) {
      console.error(`❌ Error creating JPEG ${inputPath}:`, error.message)
      this.stats.errors++
      return false
    }
  }

  async processImage(inputPath) {
    try {
      const stats = fs.statSync(inputPath)
      this.stats.originalSize += stats.size

      const filename = path.basename(inputPath)
      console.log(`📸 Processing: ${filename}`)

      // Generate WebP versions in multiple sizes
      const tasks = []
      
      // Original size WebP - preserves SEO filename
      const { outputPath: originalOutput, outputDir } = this.getOptimizedPath(inputPath, 'original', 'webp')
      tasks.push(this.optimizeImage(inputPath, originalOutput, null))

      // Responsive sizes with SEO filename + size suffix
      for (const [sizeName, width] of Object.entries(SIZES)) {
        const { outputPath: sizeOutput } = this.getOptimizedPath(inputPath, sizeName, 'webp')
        tasks.push(this.optimizeImage(inputPath, sizeOutput, width))
      }

      // Also create a high-quality JPEG fallback with SEO filename
      const { outputPath: jpegOutput } = this.getOptimizedPath(inputPath, 'original', 'jpg')
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

  async processDirectory(directory) {
    if (!fs.existsSync(directory)) {
      console.log(`⚠️  Directory not found: ${directory}`)
      return
    }

    const files = fs.readdirSync(directory)
    
    for (const file of files) {
      const filePath = path.join(directory, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await this.processDirectory(filePath)
      } else if (this.isImageFile(file)) {
        // Check if already optimized
        const { outputPath } = this.getOptimizedPath(filePath, 'original', 'webp')
        
        if (fs.existsSync(outputPath)) {
          console.log(`⏭️  Skipping (already optimized): ${file}`)
          this.stats.skipped++
          continue
        }
        
        await this.processImage(filePath)
      }
    }
  }

  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
  }

  printStats() {
    console.log('\n📊 Optimization Complete!')
    console.log('─'.repeat(40))
    console.log(`✅ Processed: ${this.stats.processed} images`)
    console.log(`⏭️  Skipped: ${this.stats.skipped} images`)
    console.log(`❌ Errors: ${this.stats.errors} images`)
    
    if (this.stats.originalSize > 0) {
      const originalMB = (this.stats.originalSize / 1024 / 1024).toFixed(2)
      const optimizedMB = (this.stats.optimizedSize / 1024 / 1024).toFixed(2)
      const savings = ((this.stats.originalSize - this.stats.optimizedSize) / this.stats.originalSize * 100).toFixed(1)
      
      console.log(`💾 Original size: ${originalMB} MB`)
      console.log(`🗜️  Optimized size: ${optimizedMB} MB`)
      console.log(`📉 Space saved: ${savings}%`)
    }
    console.log('─'.repeat(40))
  }

  async run() {
    await this.init()

    // Process all image directories
    const directories = [
      path.join(UPLOAD_DIR, 'products'),
      path.join(UPLOAD_DIR, 'categories'), 
      path.join(UPLOAD_DIR, 'posts')
    ]

    for (const dir of directories) {
      console.log(`\n🔍 Processing directory: ${path.relative(process.cwd(), dir)}`)
      await this.processDirectory(dir)
    }

    this.printStats()
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new ImageOptimizer()
  optimizer.run().catch(console.error)
}

module.exports = ImageOptimizer
