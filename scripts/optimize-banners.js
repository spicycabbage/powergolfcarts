const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const imagesToOptimize = [
  { input: 'buy-weed-online-canada-godbud.jpg', output: 'buy-weed-online-canada-godbud.webp' },
  { input: 'god-mobile.jpg', output: 'god-mobile.webp' },
  { input: 'trust-logos.png', output: 'trust-logos.webp' }
];

async function optimizeBanners() {
  console.log('Starting homepage banner optimization...');

  for (const image of imagesToOptimize) {
    const inputPath = path.join(publicDir, image.input);
    const outputPath = path.join(publicDir, image.output);

    if (fs.existsSync(inputPath)) {
      try {
        const stats = fs.statSync(inputPath);
        const originalSize = (stats.size / 1024).toFixed(2);

        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        const newStats = fs.statSync(outputPath);
        const newSize = (newStats.size / 1024).toFixed(2);
        
        console.log(`✅ Optimized ${image.input}:`);
        console.log(`   Original size: ${originalSize} KB`);
        console.log(`   New size: ${newSize} KB`);
        console.log(`   Saved to: ${outputPath}`);

      } catch (error) {
        console.error(`❌ Failed to optimize ${image.input}:`, error);
      }
    } else {
      console.warn(`⚠️  Skipping ${image.input}: File not found.`);
    }
  }

  console.log('Banner optimization complete.');
}

// Check if sharp is installed, if not, guide the user.
try {
  require.resolve('sharp');
  optimizeBanners();
} catch (e) {
  console.error('❌ Sharp library not found.');
  console.log('Please install it by running: npm install sharp');
}
