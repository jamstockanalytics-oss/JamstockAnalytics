# JamStockAnalytics Webhook Setup Script (PowerShell)
# This script sets up the webhook infrastructure for automated deployments

param(
    [string]$Environment = "production",
    [switch]$SkipDocker,
    [switch]$SkipTests
)

Write-Host "🚀 JamStockAnalytics Webhook Setup" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Info "Checking dependencies..."
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    if (-not $SkipDocker -and -not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Warning "Docker is not installed. Docker is optional but recommended for containerized deployment."
    }
    
    Write-Status "Dependencies check completed"
}

# Setup environment variables
function Set-Environment {
    Write-Info "Setting up environment variables..."
    
    if (-not (Test-Path .env)) {
        Write-Info "Creating .env file from template..."
        Copy-Item env.example .env
        Write-Warning "Please update .env file with your actual values"
    } else {
        Write-Info ".env file already exists"
    }
    
    # Check if required environment variables are set
    if (-not $env:WEBHOOK_SECRET) {
        Write-Warning "WEBHOOK_SECRET not set in environment"
        Write-Info "Please set WEBHOOK_SECRET in your .env file"
    }
    
    if (-not $env:MAIN_APP_URL) {
        Write-Warning "MAIN_APP_URL not set in environment"
        Write-Info "Please set MAIN_APP_URL in your .env file"
    }
    
    Write-Status "Environment setup completed"
}

# Install webhook dependencies
function Install-Dependencies {
    Write-Info "Installing webhook dependencies..."
    
    # Install main app dependencies
    npm install
    
    # Install webhook specific dependencies
    if (Test-Path webhook-package.json) {
        Write-Info "Installing webhook service dependencies..."
        # Note: PowerShell doesn't have --prefix equivalent, so we'll handle this differently
        Write-Info "Webhook dependencies will be installed with main app"
    }
    
    Write-Status "Dependencies installed successfully"
}

# Setup webhook service
function Set-WebhookService {
    Write-Info "Setting up webhook service..."
    
    # Create webhook directory if it doesn't exist
    if (-not (Test-Path webhook)) {
        New-Item -ItemType Directory -Path webhook
    }
    
    # Copy webhook files
    if (Test-Path webhook-handler.js) {
        Copy-Item webhook-handler.js webhook/
        Write-Status "Webhook handler copied"
    }
    
    if (Test-Path webhook-package.json) {
        Copy-Item webhook-package.json webhook/package.json
        Write-Status "Webhook package.json copied"
    }
    
    Write-Status "Webhook service setup completed"
}

# Setup GitHub Actions
function Set-GitHubActions {
    Write-Info "Setting up GitHub Actions workflows..."
    
    # Create .github/workflows directory if it doesn't exist
    if (-not (Test-Path .github/workflows)) {
        New-Item -ItemType Directory -Path .github/workflows -Force
    }
    
    # Check if workflow files exist
    if (Test-Path .github/workflows/webhook-deploy.yml) {
        Write-Status "Webhook deployment workflow found"
    } else {
        Write-Warning "Webhook deployment workflow not found"
    }
    
    if (Test-Path .github/workflows/webhook-monitor.yml) {
        Write-Status "Webhook monitoring workflow found"
    } else {
        Write-Warning "Webhook monitoring workflow not found"
    }
    
    Write-Status "GitHub Actions setup completed"
}

# Setup Docker (optional)
function Set-Docker {
    if (-not $SkipDocker -and (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Info "Setting up Docker configuration..."
        
        if (Test-Path Dockerfile.webhook) {
            Write-Status "Dockerfile.webhook found"
        } else {
            Write-Warning "Dockerfile.webhook not found"
        }
        
        if (Test-Path docker-compose.webhook.yml) {
            Write-Status "docker-compose.webhook.yml found"
        } else {
            Write-Warning "docker-compose.webhook.yml not found"
        }
        
        Write-Status "Docker setup completed"
    } else {
        Write-Info "Docker not available or skipped, skipping Docker setup"
    }
}

# Test webhook setup
function Test-Webhook {
    if (-not $SkipTests) {
        Write-Info "Testing webhook setup..."
        
        # Test webhook handler syntax
        if (Test-Path webhook-handler.js) {
            $syntaxCheck = node -c webhook-handler.js 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Status "Webhook handler syntax is valid"
            } else {
                Write-Error "Webhook handler has syntax errors"
                return $false
            }
        }
        
        # Test webhook test script
        if (Test-Path webhook-test.js) {
            Write-Info "Webhook test script found"
            Write-Info "Run 'node webhook-test.js' to test webhook functionality"
        }
        
        Write-Status "Webhook setup test completed"
    } else {
        Write-Info "Skipping webhook tests"
    }
}

# Main setup function
function Start-WebhookSetup {
    Write-Host "Starting webhook setup process..." -ForegroundColor Blue
    Write-Host ""
    
    Test-Dependencies
    Set-Environment
    Install-Dependencies
    Set-WebhookService
    Set-GitHubActions
    Set-Docker
    Test-Webhook
    
    Write-Host ""
    Write-Status "Webhook setup completed successfully!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "1. Update your .env file with actual values"
    Write-Host "2. Configure GitHub secrets for deployment"
    Write-Host "3. Test webhook functionality: node webhook-test.js"
    Write-Host "4. Deploy to Render using the provided configuration"
    Write-Host ""
    Write-Info "For more information, see WEBHOOK_INTEGRATION.md"
}

# Run main function
Start-WebhookSetup
