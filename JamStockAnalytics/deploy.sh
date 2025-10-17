#!/bin/bash

# JamStockAnalytics Chat Server Deployment Script
# Supports multiple deployment targets

set -e

# Configuration
PROJECT_NAME="jamstockanalytics-chat"
SERVER_FILE="server.ts"
BUILD_DIR="dist"
DEPLOY_TARGET=${1:-"local"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v deno &> /dev/null; then
        log_error "Deno is not installed. Please install Deno first."
        exit 1
    fi
    
    if [ ! -f "$SERVER_FILE" ]; then
        log_error "Server file $SERVER_FILE not found."
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Please create one from env.example"
        log_info "Required environment variables:"
        echo "  SUPABASE_URL=https://your-project-id.supabase.co"
        echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
        read -p "Do you want to continue without .env? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Build the application
build_app() {
    log_info "Building application..."
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Compile to executable
    deno compile \
        --allow-net \
        --allow-env \
        --output "$BUILD_DIR/$PROJECT_NAME" \
        "$SERVER_FILE"
    
    log_success "Application built successfully"
}

# Deploy to local
deploy_local() {
    log_info "Deploying locally..."
    
    # Check if server is already running
    if pgrep -f "$PROJECT_NAME" > /dev/null; then
        log_warning "Server appears to be running. Stopping..."
        pkill -f "$PROJECT_NAME" || true
        sleep 2
    fi
    
    # Start server in background
    log_info "Starting server..."
    nohup "$BUILD_DIR/$PROJECT_NAME" > server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server started successfully
    if kill -0 $SERVER_PID 2>/dev/null; then
        log_success "Server started successfully (PID: $SERVER_PID)"
        log_info "Logs: tail -f server.log"
        log_info "Stop server: kill $SERVER_PID"
    else
        log_error "Failed to start server"
        cat server.log
        exit 1
    fi
}

# Deploy to Deno Deploy
deploy_deno_deploy() {
    log_info "Deploying to Deno Deploy..."
    
    # Check if deployctl is installed
    if ! command -v deployctl &> /dev/null; then
        log_info "Installing deployctl..."
        deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
    fi
    
    # Deploy
    deployctl deploy --project="$PROJECT_NAME" "$SERVER_FILE"
    
    log_success "Deployed to Deno Deploy successfully"
}

# Deploy to Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Create Dockerfile
    cat > Dockerfile << EOF
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
EOF

    # Build Docker image
    docker build -t "$PROJECT_NAME" .
    
    # Run container
    docker run -d \
        --name "$PROJECT_NAME" \
        -p 8000:8000 \
        --env-file .env \
        "$PROJECT_NAME"
    
    log_success "Docker deployment completed"
    log_info "Container name: $PROJECT_NAME"
    log_info "Port: 8000"
}

# Deploy to VPS/Cloud
deploy_vps() {
    log_info "Deploying to VPS/Cloud..."
    
    # Build application
    build_app
    
    # Create systemd service file
    cat > "$PROJECT_NAME.service" << EOF
[Unit]
Description=JamStockAnalytics Chat Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/$BUILD_DIR/$PROJECT_NAME
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    log_info "Created systemd service file: $PROJECT_NAME.service"
    log_info "To install service:"
    echo "  sudo cp $PROJECT_NAME.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable $PROJECT_NAME"
    echo "  sudo systemctl start $PROJECT_NAME"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."
    
    # Wait for server to be ready
    sleep 5
    
    # Test health endpoint
    if curl -f -s "$BASE_URL/health" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        return 1
    fi
    
    # Test messages endpoint
    if curl -f -s "$BASE_URL/messages" > /dev/null; then
        log_success "Messages endpoint working"
    else
        log_warning "Messages endpoint failed (may be normal if no data)"
    fi
    
    log_success "Deployment test completed"
}

# Main deployment function
main() {
    log_info "Starting deployment to: $DEPLOY_TARGET"
    
    case $DEPLOY_TARGET in
        "local")
            check_prerequisites
            build_app
            deploy_local
            test_deployment
            ;;
        "deno-deploy")
            check_prerequisites
            deploy_deno_deploy
            ;;
        "docker")
            check_prerequisites
            deploy_docker
            ;;
        "vps")
            check_prerequisites
            deploy_vps
            ;;
        "build")
            check_prerequisites
            build_app
            log_success "Build completed. Executable: $BUILD_DIR/$PROJECT_NAME"
            ;;
        *)
            log_error "Unknown deployment target: $DEPLOY_TARGET"
            echo "Available targets: local, deno-deploy, docker, vps, build"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "JamStockAnalytics Chat Server Deployment Script"
    echo ""
    echo "Usage: $0 [TARGET]"
    echo ""
    echo "Targets:"
    echo "  local       Deploy locally (default)"
    echo "  deno-deploy Deploy to Deno Deploy"
    echo "  docker      Deploy with Docker"
    echo "  vps         Prepare for VPS deployment"
    echo "  build       Build executable only"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 deno-deploy"
    echo "  $0 docker"
    echo ""
    exit 0
fi

# Run main function
main
