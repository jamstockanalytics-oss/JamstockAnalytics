# build-and-push.ps1

param(
    [string]$Tag = "latest"
)

# Configuration
$IMAGE_NAME = "jamstockanalytics"
$REGISTRY = "yourusername"  # Replace with your Docker Hub username
$FULL_TAG = "$REGISTRY/$IMAGE_NAME`:$Tag"

Write-Host "🚀 Building Docker image: $IMAGE_NAME`:$Tag" -ForegroundColor Green

try {
    # Build image
    Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
    docker build -t $IMAGE_NAME`:$Tag .
    
    # Tag for registry
    Write-Host "🏷️ Tagging image for registry..." -ForegroundColor Yellow
    docker tag $IMAGE_NAME`:$Tag $FULL_TAG
    
    # Push to registry
    Write-Host "📤 Pushing to registry..." -ForegroundColor Yellow
    docker push $FULL_TAG
    
    Write-Host "✅ Successfully pushed $FULL_TAG" -ForegroundColor Green
    
    # Optional: Clean up local images
    Write-Host "🧹 Cleaning up local images..." -ForegroundColor Yellow
    docker rmi $IMAGE_NAME`:$Tag $FULL_TAG
    
    Write-Host "🎉 Build and push completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Live site: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
