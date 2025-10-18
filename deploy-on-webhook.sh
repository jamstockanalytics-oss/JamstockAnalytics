#!/bin/bash

# Deploy script triggered by Docker Hub webhook
# This script handles the actual deployment when a new image is pushed

set -e

# Configuration
DOCKER_IMAGE="jamstockanalytics/jamstockanalytics"
CONTAINER_NAME="jamstockanalytics-web"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/tmp/jamstockanalytics-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a non-root user for security."
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
    log_success "Docker is running"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        mkdir -p $BACKUP_DIR
        
        # Export current container
        docker export $CONTAINER_NAME > $BACKUP_DIR/container-backup.tar
        
        # Save current image
        docker save $DOCKER_IMAGE:latest > $BACKUP_DIR/image-backup.tar
        
        log_success "Backup created at $BACKUP_DIR"
    else
        log "No running container found, skipping backup"
    fi
}

# Pull latest image
pull_latest_image() {
    log "Pulling latest image: $DOCKER_IMAGE"
    
    if docker pull $DOCKER_IMAGE:latest; then
        log_success "Successfully pulled latest image"
    else
        log_error "Failed to pull latest image"
        exit 1
    fi
}

# Stop current deployment
stop_current_deployment() {
    log "Stopping current deployment..."
    
    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f $COMPOSE_FILE down
        log_success "Stopped deployment using docker-compose"
    else
        # Fallback to direct container management
        if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
            docker stop $CONTAINER_NAME
            docker rm $CONTAINER_NAME
            log_success "Stopped and removed container"
        fi
    fi
}

# Deploy new version
deploy_new_version() {
    log "Deploying new version..."
    
    if [ -f "$COMPOSE_FILE" ]; then
        # Use docker-compose for deployment
        docker-compose -f $COMPOSE_FILE up -d
        
        # Wait for container to be healthy
        log "Waiting for container to be healthy..."
        timeout=60
        while [ $timeout -gt 0 ]; do
            if docker ps -f name=$CONTAINER_NAME --format "table {{.Status}}" | grep -q "healthy\|Up"; then
                log_success "Container is healthy"
                break
            fi
            sleep 2
            timeout=$((timeout - 2))
        done
        
        if [ $timeout -le 0 ]; then
            log_error "Container failed to become healthy"
            return 1
        fi
    else
        # Fallback to direct docker run
        docker run -d \
            --name $CONTAINER_NAME \
            --restart unless-stopped \
            -p 80:80 \
            $DOCKER_IMAGE:latest
        
        log_success "Container started directly"
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if container is running
    if ! docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log_error "Container is not running"
        return 1
    fi
    
    # Check if application is responding
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/ > /dev/null 2>&1; then
            log_success "Application is responding on http://localhost/"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Application not ready yet..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_error "Application failed to respond after $max_attempts attempts"
    return 1
}

# Cleanup old images
cleanup_old_images() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Keep only the latest 3 versions of our image
    docker images $DOCKER_IMAGE --format "table {{.Tag}}\t{{.ID}}" | \
        tail -n +2 | \
        sort -V | \
        head -n -3 | \
        awk '{print $2}' | \
        xargs -r docker rmi -f 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Rollback function
rollback() {
    log_error "Deployment failed, attempting rollback..."
    
    if [ -d "$BACKUP_DIR" ]; then
        # Stop current container
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        
        # Restore from backup
        if [ -f "$BACKUP_DIR/image-backup.tar" ]; then
            docker load < $BACKUP_DIR/image-backup.tar
            docker run -d --name $CONTAINER_NAME -p 80:80 $DOCKER_IMAGE:latest
            log_success "Rollback completed"
        else
            log_error "No backup found for rollback"
        fi
    else
        log_error "No backup directory found for rollback"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting automated deployment triggered by Docker Hub webhook"
    
    # Pre-deployment checks
    check_permissions
    check_docker
    
    # Backup current state
    backup_current
    
    # Pull latest image
    if ! pull_latest_image; then
        log_error "Failed to pull latest image"
        exit 1
    fi
    
    # Stop current deployment
    stop_current_deployment
    
    # Deploy new version
    if ! deploy_new_version; then
        log_error "Deployment failed"
        rollback
        exit 1
    fi
    
    # Verify deployment
    if ! verify_deployment; then
        log_error "Deployment verification failed"
        rollback
        exit 1
    fi
    
    # Cleanup
    cleanup_old_images
    
    log_success "🎉 Deployment completed successfully!"
    log "🌐 Application is available at: http://localhost/"
    
    # Clean up backup after successful deployment
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf $BACKUP_DIR
        log "Cleaned up backup directory"
    fi
}

# Handle errors
trap 'log_error "Script interrupted"; rollback; exit 1' INT TERM

# Run main function
main "$@"
