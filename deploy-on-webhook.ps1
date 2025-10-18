# Deploy script triggered by Docker Hub webhook
# This script handles the actual deployment when a new image is pushed

param(
    [string]$DockerImage = "jamstockanalytics/jamstockanalytics",
    [string]$ContainerName = "jamstockanalytics-web",
    [string]$ComposeFile = "docker-compose.prod.yml"
)

# Configuration
$BackupDir = "C:\temp\jamstockanalytics-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Write-Success { param([string]$Message) Write-Log "✅ $Message" "SUCCESS" }
function Write-Warning { param([string]$Message) Write-Log "⚠️ $Message" "WARNING" }
function Write-Error { param([string]$Message) Write-Log "❌ $Message" "ERROR" }

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running or not accessible"
        return $false
    }
}

# Backup current deployment
function Backup-Current {
    Write-Log "Creating backup of current deployment..."
    
    if (docker ps -q -f "name=$ContainerName") {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        
        # Export current container
        docker export $ContainerName > "$BackupDir\container-backup.tar"
        
        # Save current image
        docker save $DockerImage`:latest > "$BackupDir\image-backup.tar"
        
        Write-Success "Backup created at $BackupDir"
    }
    else {
        Write-Log "No running container found, skipping backup"
    }
}

# Pull latest image
function Pull-LatestImage {
    Write-Log "Pulling latest image: $DockerImage"
    
    try {
        docker pull "$DockerImage`:latest"
        Write-Success "Successfully pulled latest image"
        return $true
    }
    catch {
        Write-Error "Failed to pull latest image"
        return $false
    }
}

# Stop current deployment
function Stop-CurrentDeployment {
    Write-Log "Stopping current deployment..."
    
    if (Test-Path $ComposeFile) {
        docker-compose -f $ComposeFile down
        Write-Success "Stopped deployment using docker-compose"
    }
    else {
        # Fallback to direct container management
        if (docker ps -q -f "name=$ContainerName") {
            docker stop $ContainerName
            docker rm $ContainerName
            Write-Success "Stopped and removed container"
        }
    }
}

# Deploy new version
function Deploy-NewVersion {
    Write-Log "Deploying new version..."
    
    if (Test-Path $ComposeFile) {
        # Use docker-compose for deployment
        docker-compose -f $ComposeFile up -d
        
        # Wait for container to be healthy
        Write-Log "Waiting for container to be healthy..."
        $timeout = 60
        while ($timeout -gt 0) {
            $status = docker ps -f "name=$ContainerName" --format "table {{.Status}}"
            if ($status -match "healthy|Up") {
                Write-Success "Container is healthy"
                return $true
            }
            Start-Sleep -Seconds 2
            $timeout -= 2
        }
        
        Write-Error "Container failed to become healthy"
        return $false
    }
    else {
        # Fallback to direct docker run
        docker run -d --name $ContainerName --restart unless-stopped -p 80:80 "$DockerImage`:latest"
        Write-Success "Container started directly"
        return $true
    }
}

# Verify deployment
function Test-Deployment {
    Write-Log "Verifying deployment..."
    
    # Check if container is running
    if (-not (docker ps -q -f "name=$ContainerName")) {
        Write-Error "Container is not running"
        return $false
    }
    
    # Check if application is responding
    $maxAttempts = 10
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Application is responding on http://localhost/"
                return $true
            }
        }
        catch {
            Write-Log "Attempt $attempt/$maxAttempts : Application not ready yet..."
            Start-Sleep -Seconds 5
            $attempt++
        }
    }
    
    Write-Error "Application failed to respond after $maxAttempts attempts"
    return $false
}

# Cleanup old images
function Remove-OldImages {
    Write-Log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Keep only the latest 3 versions of our image
    $oldImages = docker images $DockerImage --format "{{.ID}}" | Select-Object -Skip 3
    if ($oldImages) {
        $oldImages | ForEach-Object { docker rmi -f $_ }
    }
    
    Write-Success "Cleanup completed"
}

# Rollback function
function Invoke-Rollback {
    Write-Error "Deployment failed, attempting rollback..."
    
    if (Test-Path $BackupDir) {
        # Stop current container
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
        
        # Restore from backup
        if (Test-Path "$BackupDir\image-backup.tar") {
            docker load -i "$BackupDir\image-backup.tar"
            docker run -d --name $ContainerName -p 80:80 "$DockerImage`:latest"
            Write-Success "Rollback completed"
        }
        else {
            Write-Error "No backup found for rollback"
        }
    }
    else {
        Write-Error "No backup directory found for rollback"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Log "🚀 Starting automated deployment triggered by Docker Hub webhook"
    
    # Pre-deployment checks
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Backup current state
    Backup-Current
    
    # Pull latest image
    if (-not (Pull-LatestImage)) {
        Write-Error "Failed to pull latest image"
        exit 1
    }
    
    # Stop current deployment
    Stop-CurrentDeployment
    
    # Deploy new version
    if (-not (Deploy-NewVersion)) {
        Write-Error "Deployment failed"
        Invoke-Rollback
        exit 1
    }
    
    # Verify deployment
    if (-not (Test-Deployment)) {
        Write-Error "Deployment verification failed"
        Invoke-Rollback
        exit 1
    }
    
    # Cleanup
    Remove-OldImages
    
    Write-Success "🎉 Deployment completed successfully!"
    Write-Log "🌐 Application is available at: http://localhost/"
    
    # Clean up backup after successful deployment
    if (Test-Path $BackupDir) {
        Remove-Item -Path $BackupDir -Recurse -Force
        Write-Log "Cleaned up backup directory"
    }
}

# Run main function
try {
    Start-Deployment
}
catch {
    Write-Error "Script interrupted: $($_.Exception.Message)"
    Invoke-Rollback
    exit 1
}
