# JamStockAnalytics Chat Server Deployment Script (PowerShell)
# Supports multiple deployment targets

param(
    [Parameter(Position=0)]
    [string]$Target = "local"
)

# Configuration
$PROJECT_NAME = "jamstockanalytics-chat"
$SERVER_FILE = "server.ts"
$BUILD_DIR = "dist"

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
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

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if Deno is installed
    try {
        $null = Get-Command deno -ErrorAction Stop
    }
    catch {
        Write-Error "Deno is not installed. Please install Deno first."
        Write-Info "Install instructions: https://deno.land/manual/getting_started/installation"
        exit 1
    }
    
    # Check if server file exists
    if (-not (Test-Path $SERVER_FILE)) {
        Write-Error "Server file $SERVER_FILE not found."
        exit 1
    }
    
    # Check for environment file
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Please create one from env.example"
        Write-Info "Required environment variables:"
        Write-Host "  SUPABASE_URL=https://your-project-id.supabase.co"
        Write-Host "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
        $continue = Read-Host "Do you want to continue without .env? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 1
        }
    }
    
    Write-Success "Prerequisites check passed"
}

# Build the application
function Build-App {
    Write-Info "Building application..."
    
    # Create build directory
    if (-not (Test-Path $BUILD_DIR)) {
        New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
    }
    
    # Compile to executable
    $buildArgs = @(
        "compile",
        "--allow-net",
        "--allow-env",
        "--output", "$BUILD_DIR\$PROJECT_NAME.exe",
        $SERVER_FILE
    )
    
    & deno @buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application built successfully"
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

# Deploy locally
function Deploy-Local {
    Write-Info "Deploying locally..."
    
    # Check if server is already running
    $runningProcesses = Get-Process | Where-Object { $_.ProcessName -like "*$PROJECT_NAME*" }
    if ($runningProcesses) {
        Write-Warning "Server appears to be running. Stopping..."
        $runningProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
    
    # Start server
    Write-Info "Starting server..."
    $serverPath = "$BUILD_DIR\$PROJECT_NAME.exe"
    
    if (Test-Path $serverPath) {
        Start-Process -FilePath $serverPath -WindowStyle Hidden -RedirectStandardOutput "server.log" -RedirectStandardError "server.log"
        Start-Sleep -Seconds 3
        
        Write-Success "Server started successfully"
        Write-Info "Logs: Get-Content server.log -Wait"
        Write-Info "Stop server: Stop-Process -Name '$PROJECT_NAME' -Force"
    } else {
        Write-Error "Server executable not found at $serverPath"
        exit 1
    }
}

# Deploy to Deno Deploy
function Deploy-DenoDeploy {
    Write-Info "Deploying to Deno Deploy..."
    
    # Check if deployctl is installed
    try {
        $null = Get-Command deployctl -ErrorAction Stop
    }
    catch {
        Write-Info "Installing deployctl..."
        deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
    }
    
    # Deploy
    deployctl deploy --project="$PROJECT_NAME" $SERVER_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployed to Deno Deploy successfully"
    } else {
        Write-Error "Deploy to Deno Deploy failed"
        exit 1
    }
}

# Deploy with Docker
function Deploy-Docker {
    Write-Info "Deploying with Docker..."
    
    # Create Dockerfile
    $dockerfileContent = @"
FROM denoland/deno:1.40.0

WORKDIR /app

# Copy server files
COPY server.ts .
COPY deno.json .
COPY .env .

# Expose port
EXPOSE 8000

# Start server
CMD ["deno", "run", "--allow-net", "--allow-env", "server.ts"]
"@
    
    $dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding UTF8
    
    # Build Docker image
    Write-Info "Building Docker image..."
    docker build -t $PROJECT_NAME .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker image built successfully"
        
        # Run container
        Write-Info "Starting Docker container..."
        docker run -d --name $PROJECT_NAME -p 8000:8000 --env-file .env $PROJECT_NAME
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker deployment completed"
            Write-Info "Container name: $PROJECT_NAME"
            Write-Info "Port: 8000"
        } else {
            Write-Error "Failed to start Docker container"
            exit 1
        }
    } else {
        Write-Error "Docker build failed"
        exit 1
    }
}

# Test deployment
function Test-Deployment {
    param([string]$BaseUrl = "http://localhost:8000")
    
    Write-Info "Testing deployment..."
    
    # Wait for server to be ready
    Start-Sleep -Seconds 5
    
    try {
        # Test health endpoint
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed"
        } else {
            Write-Error "Health check failed with status: $($response.StatusCode)"
            return $false
        }
        
        # Test messages endpoint
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/messages" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "Messages endpoint working"
            }
        }
        catch {
            Write-Warning "Messages endpoint failed (may be normal if no data): $($_.Exception.Message)"
        }
        
        Write-Success "Deployment test completed"
        return $true
    }
    catch {
        Write-Error "Deployment test failed: $($_.Exception.Message)"
        return $false
    }
}

# Main deployment function
function Start-Deployment {
    Write-Info "Starting deployment to: $Target"
    
    switch ($Target.ToLower()) {
        "local" {
            Test-Prerequisites
            Build-App
            Deploy-Local
            Test-Deployment
        }
        "deno-deploy" {
            Test-Prerequisites
            Deploy-DenoDeploy
        }
        "docker" {
            Test-Prerequisites
            Deploy-Docker
        }
        "build" {
            Test-Prerequisites
            Build-App
            Write-Success "Build completed. Executable: $BUILD_DIR\$PROJECT_NAME.exe"
        }
        default {
            Write-Error "Unknown deployment target: $Target"
            Write-Info "Available targets: local, deno-deploy, docker, build"
            exit 1
        }
    }
    
    Write-Success "Deployment completed successfully!"
}

# Show usage if help requested
if ($Target -eq "help" -or $Target -eq "-h" -or $Target -eq "--help") {
    Write-Host "JamStockAnalytics Chat Server Deployment Script (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [TARGET]"
    Write-Host ""
    Write-Host "Targets:"
    Write-Host "  local       Deploy locally (default)"
    Write-Host "  deno-deploy Deploy to Deno Deploy"
    Write-Host "  docker      Deploy with Docker"
    Write-Host "  build       Build executable only"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 local"
    Write-Host "  .\deploy.ps1 deno-deploy"
    Write-Host "  .\deploy.ps1 docker"
    Write-Host ""
    exit 0
}

# Run main deployment
Start-Deployment
