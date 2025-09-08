$ErrorActionPreference = 'SilentlyContinue'

param(
  [string]$BaseUrl = 'http://localhost:3000'
)

function Hit($path) {
  try {
    Invoke-WebRequest -Uri ("$BaseUrl$path") -UseBasicParsing -TimeoutSec 5 | Out-Null
  } catch {
    # ignore
  }
}

Write-Output "Warming up $BaseUrl..."
Hit '/api/warmup'
Hit '/'
Hit '/products'
Hit '/api/shipping'
Hit '/blog'
Write-Output 'Warmup complete.'


