#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

class SiteDeployer {
  constructor() {
    this.sitesDir = path.join(__dirname, '..', 'sites')
  }

  async deploySite() {
    console.log('🚀 Ecommerce Site Deployer')
    console.log('==========================')

    try {
      const siteId = await question('Enter site ID to deploy: ')
      const platform = await question('Choose platform (vercel/netlify/heroku): ')

      const siteDir = path.join(this.sitesDir, siteId)
      if (!fs.existsSync(siteDir)) {
        console.error(`❌ Site '${siteId}' not found in sites/${siteId}`)
        return
      }

      const configPath = path.join(siteDir, 'config.json')
      if (!fs.existsSync(configPath)) {
        console.error(`❌ Site configuration not found: ${configPath}`)
        return
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

      console.log(`\n📦 Deploying site: ${config.name}`)
      console.log(`🌐 Domain: ${config.domain}`)
      console.log(`🏗️  Platform: ${platform}`)

      switch (platform.toLowerCase()) {
        case 'vercel':
          await this.deployToVercel(siteId, config)
          break
        case 'netlify':
          await this.deployToNetlify(siteId, config)
          break
        case 'heroku':
          await this.deployToHeroku(siteId, config)
          break
        default:
          console.error('❌ Unsupported platform. Choose: vercel, netlify, or heroku')
      }

    } catch (error) {
      console.error('❌ Deployment failed:', error.message)
    } finally {
      rl.close()
    }
  }

  async deployToVercel(siteId, config) {
    console.log('\n🔧 Setting up Vercel deployment...')

    // Create vercel.json
    const vercelConfig = {
      version: 2,
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      env: {
        NEXT_PUBLIC_SITE_ID: siteId,
        NEXT_PUBLIC_SITE_NAME: config.name,
        NEXT_PUBLIC_DOMAIN: config.domain,
      },
      functions: {
        'src/app/api/**/*.ts': {
          runtime: 'nodejs18.x'
        }
      },
      rewrites: [
        { source: '/api/(.*)', destination: '/api/$1' },
        { source: '/(.*)', destination: '/index.html' }
      ]
    }

    const siteDir = path.join(this.sitesDir, siteId)
    const vercelPath = path.join(siteDir, 'vercel.json')
    fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2))

    console.log('✅ Created vercel.json')
    console.log('\n📋 Vercel Deployment Steps:')
    console.log('1. Install Vercel CLI: npm i -g vercel')
    console.log(`2. cd sites/${siteId}`)
    console.log('3. Copy .env.local.template to .env.local and fill in values')
    console.log(`4. vercel --prod`)
    console.log('5. Add your domain in Vercel dashboard')
  }

  async deployToNetlify(siteId, config) {
    console.log('\n🔧 Setting up Netlify deployment...')

    // Create netlify.toml
    const netlifyConfig = `[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_SITE_ID = "${siteId}"
  NEXT_PUBLIC_SITE_NAME = "${config.name}"
  NEXT_PUBLIC_DOMAIN = "${config.domain}"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`

    const siteDir = path.join(this.sitesDir, siteId)
    const netlifyPath = path.join(siteDir, 'netlify.toml')
    fs.writeFileSync(netlifyPath, netlifyConfig)

    // Create _redirects file
    const redirectsContent = `
/api/* /.netlify/functions/:splat 200
/* /index.html 200
`

    const redirectsPath = path.join(siteDir, '_redirects')
    fs.writeFileSync(redirectsPath, redirectsContent)

    console.log('✅ Created netlify.toml and _redirects')
    console.log('\n📋 Netlify Deployment Steps:')
    console.log(`1. cd sites/${siteId}`)
    console.log('2. Copy .env.local.template to .env.local and fill in values')
    console.log('3. Install Netlify CLI: npm install -g netlify-cli')
    console.log('4. netlify login')
    console.log('5. netlify init')
    console.log('6. netlify deploy --prod')
  }

  async deployToHeroku(siteId, config) {
    console.log('\n🔧 Setting up Heroku deployment...')

    const siteDir = path.join(this.sitesDir, siteId)

    // Create Procfile
    const procfileContent = 'web: npm start'
    const procfilePath = path.join(siteDir, 'Procfile')
    fs.writeFileSync(procfilePath, procfileContent)

    // Update package.json with Heroku-specific settings
    const packagePath = path.join(siteDir, 'package.json')
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      pkg.scripts = pkg.scripts || {}
      pkg.scripts['heroku-postbuild'] = 'npm run build'
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
    }

    console.log('✅ Created Procfile and updated package.json')
    console.log('\n📋 Heroku Deployment Steps:')
    console.log('1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli')
    console.log('2. heroku login')
    console.log(`3. cd sites/${siteId}`)
    console.log(`4. heroku create ${siteId}-store`)
    console.log('5. Copy .env.local.template to .env and fill in values')
    console.log('6. heroku config:set $(cat .env | xargs)')
    console.log('7. git init && git add . && git commit -m "Initial commit"')
    console.log('8. git push heroku main')
  }
}

// Run if called directly
if (require.main === module) {
  const deployer = new SiteDeployer()
  deployer.deploySite()
}

module.exports = { SiteDeployer }


