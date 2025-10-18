#!/bin/bash
# build-and-push.sh

set -e

# Configuration
IMAGE_NAME="jamstockanalytics"
REGISTRY="yourusername"  # Replace with your Docker Hub username
TAG=${1:-latest}

echo "🚀 Building Docker image: $IMAGE_NAME:$TAG"

# Build image
docker build -t $IMAGE_NAME:$TAG .

# Tag for registry
docker tag $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG

# Push to registry
echo "📦 Pushing to registry..."
docker push $REGISTRY/$IMAGE_NAME:$TAG

echo "✅ Successfully pushed $REGISTRY/$IMAGE_NAME:$TAG"

# Optional: Clean up local images
docker rmi $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG

echo "🧹 Cleaned up local images"
