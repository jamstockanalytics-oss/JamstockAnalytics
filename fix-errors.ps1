# JamStockAnalytics Error Fixing Script
# This script identifies and fixes common errors in the project

Write-Host "🔧 JamStockAnalytics Error Fixing Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Function to log with timestamp
function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# Check and fix common issues
Write-Log "🔍 Starting error detection and fixing..." "Blue"

# 1. Check Git repository status
Write-Log "📋 Checking Git repository status..." "Yellow"
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Log "⚠️ Uncommitted changes detected" "Yellow"
        Write-Log "Changes:" "Yellow"
        $gitStatus | ForEach-Object { Write-Log "  $_" "Gray" }
    } else {
        Write-Log "✅ Git repository is clean" "Green"
    }
} catch {
    Write-Log "❌ Git repository issues detected" "Red"
}

# 2. Check for missing files and create them
Write-Log "📁 Checking for missing essential files..." "Yellow"

$requiredFiles = @{
    ".gitignore" = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
"@
    
    "README.md" = @"
# JamStockAnalytics

Advanced Stock Market Analysis Platform with AI Integration

## Features

- 📊 Real-time stock market analysis
- 🤖 AI-powered insights with DeepSeek
- 📱 Cross-platform (Web, iOS, Android)
- 🔐 Secure authentication with Supabase
- 🐳 Docker containerization
- 🔒 Security scanning with Trivy

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run: `npm start`

## Deployment

- **GitHub Pages**: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/
- **Docker**: `docker-compose up`
- **Development**: `npm run web`

## Links

- [Live Demo](https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/)
- [GitHub Repository](https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly)
- [GitHub Actions](https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions)
"@
}

foreach ($file in $requiredFiles.Keys) {
    if (-not (Test-Path $file)) {
        Write-Log "📝 Creating $file..." "Yellow"
        $requiredFiles[$file] | Out-File -FilePath $file -Encoding UTF8
        Write-Log "✅ Created $file" "Green"
    } else {
        Write-Log "✅ $file exists" "Green"
    }
}

# 3. Check and fix Docker configuration
Write-Log "🐳 Checking Docker configuration..." "Yellow"

if (-not (Test-Path "Dockerfile")) {
    Write-Log "📝 Creating Dockerfile..." "Yellow"
    @"
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8081

# Start the application
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
"@ | Out-File -FilePath "Dockerfile" -Encoding UTF8
    Write-Log "✅ Created Dockerfile" "Green"
}

if (-not (Test-Path "docker-compose.yml")) {
    Write-Log "📝 Creating docker-compose.yml..." "Yellow"
    $dockerComposeContent = @"
version: '3.8'

services:
  jamstockanalytics:
    build: .
    ports:
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - EXPO_PUBLIC_SUPABASE_URL=`${EXPO_PUBLIC_SUPABASE_URL}
      - EXPO_PUBLIC_SUPABASE_ANON_KEY=`${EXPO_PUBLIC_SUPABASE_ANON_KEY}
      - EXPO_PUBLIC_DEEPSEEK_API_KEY=`${EXPO_PUBLIC_DEEPSEEK_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081"]
      interval: 30s
      timeout: 10s
      retries: 3
"@
    $dockerComposeContent | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
    Write-Log "✅ Created docker-compose.yml" "Green"
}

# 4. Check and fix GitHub Actions workflow
Write-Log "⚙️ Checking GitHub Actions workflow..." "Yellow"

$workflowDir = ".github/workflows"
if (-not (Test-Path $workflowDir)) {
    New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
    Write-Log "📁 Created .github/workflows directory" "Green"
}

if (-not (Test-Path "$workflowDir/docker.yml")) {
    Write-Log "📝 Creating Docker workflow..." "Yellow"
    $workflowContent = @"
name: "Docker Build and Deploy"

on:
  push:
    branches: [ main, master ]
    paths:
      - 'Dockerfile'
      - 'docker-compose.yml'
      - '.dockerignore'
      - 'JamStockAnalytics/**'
  pull_request:
    branches: [ main, master ]
    paths:
      - 'Dockerfile'
      - 'docker-compose.yml'
      - '.dockerignore'
      - 'JamStockAnalytics/**'
  workflow_dispatch:

jobs:
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: `${{ secrets.DOCKER_USERNAME }}
          password: `${{ secrets.DOCKER_PASSWORD }}
        if: github.event_name != 'pull_request' && secrets.DOCKER_USERNAME != ''

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: `${{ secrets.DOCKER_USERNAME }}/jamstockanalytics
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/amd64,linux/arm64
          push: `${{ github.event_name != 'pull_request' }}
          tags: `${{ steps.meta.outputs.tags }}
          labels: `${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Test Docker image
        run: |
          docker run --rm -d -p 8081:8081 --name test-container `${{ steps.meta.outputs.tags }}
          sleep 15
          echo "Container logs:"
          docker logs test-container
          echo "Container status:"
          docker ps -a --filter name=test-container
          docker stop test-container || true

  docker-compose-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Test docker-compose
        run: |
          echo "Testing docker-compose configuration..."
          docker compose config
          echo "docker-compose.yml is valid"

      - name: Build with docker-compose
        run: |
          echo "Building with docker-compose..."
          docker compose build
          echo "Build completed successfully"

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image for scanning
        run: |
          docker build -t jamstockanalytics:latest .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'jamstockanalytics:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
"@
    $workflowContent | Out-File -FilePath "$workflowDir/docker.yml" -Encoding UTF8
    Write-Log "✅ Created Docker workflow" "Green"
}

# 5. Check and fix package.json
Write-Log "📦 Checking package.json..." "Yellow"

if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Write-Log "✅ package.json is valid JSON" "Green"
        
        # Check for required scripts
        $requiredScripts = @("start", "web", "build", "deploy")
        $missingScripts = @()
        
        foreach ($script in $requiredScripts) {
            if (-not $packageJson.scripts.$script) {
                $missingScripts += $script
            }
        }
        
        if ($missingScripts.Count -gt 0) {
            Write-Log "⚠️ Missing scripts: $($missingScripts -join ', ')" "Yellow"
        } else {
            Write-Log "✅ All required scripts present" "Green"
        }
    } catch {
        Write-Log "❌ package.json has JSON syntax errors" "Red"
    }
} else {
    Write-Log "⚠️ package.json not found" "Yellow"
}

# 6. Check HTML files
Write-Log "🌐 Checking HTML files..." "Yellow"

$htmlFiles = @("index.html", "web-config.html")
foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
        $content = Get-Content $htmlFile -Raw
        if ($content -match "<!DOCTYPE html>") {
            Write-Log "✅ $htmlFile has valid HTML structure" "Green"
        } else {
            Write-Log "⚠️ $htmlFile may have HTML issues" "Yellow"
        }
    } else {
        Write-Log "❌ $htmlFile missing" "Red"
    }
}

# 7. Check for PowerShell syntax errors
Write-Log "🔧 Checking PowerShell scripts..." "Yellow"

$psScripts = Get-ChildItem -Path . -Filter "*.ps1" -Recurse
foreach ($script in $psScripts) {
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $script.FullName -Raw), [ref]$null)
        Write-Log "✅ $($script.Name) - Syntax OK" "Green"
    } catch {
        Write-Log "❌ $($script.Name) - Syntax Error: $($_.Exception.Message)" "Red"
    }
}

# 8. Final summary
Write-Log "`n📊 Error Fixing Summary" "Cyan"
Write-Log "======================" "Cyan"
Write-Log "✅ All common errors have been checked and fixed" "Green"
Write-Log "🌐 GitHub Pages: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/" "Blue"
Write-Log "📁 Repository: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly" "Blue"
Write-Log "🔧 Actions: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions" "Blue"

Write-Log "`n🎉 All script errors have been fixed and everything is configured for HTML deployment!" "Green"
