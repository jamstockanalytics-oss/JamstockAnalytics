#!/bin/bash

# JamStockAnalytics Webhook Setup Script
# This script sets up the webhook infrastructure for automated deployments

set -e

echo "🚀 JamStockAnalytics Webhook Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker is optional but recommended for containerized deployment."
    fi
    
    print_status "Dependencies check completed"
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp env.example .env
        print_warning "Please update .env file with your actual values"
    else
        print_info ".env file already exists"
    fi
    
    # Check if required environment variables are set
    if [ -z "$WEBHOOK_SECRET" ]; then
        print_warning "WEBHOOK_SECRET not set in environment"
        print_info "Please set WEBHOOK_SECRET in your .env file"
    fi
    
    if [ -z "$MAIN_APP_URL" ]; then
        print_warning "MAIN_APP_URL not set in environment"
        print_info "Please set MAIN_APP_URL in your .env file"
    fi
    
    print_status "Environment setup completed"
}

# Install webhook dependencies
install_dependencies() {
    print_info "Installing webhook dependencies..."
    
    # Install main app dependencies
    npm install
    
    # Install webhook specific dependencies
    if [ -f webhook-package.json ]; then
        print_info "Installing webhook service dependencies..."
        npm install --prefix webhook
    fi
    
    print_status "Dependencies installed successfully"
}

# Setup webhook service
setup_webhook_service() {
    print_info "Setting up webhook service..."
    
    # Create webhook directory if it doesn't exist
    mkdir -p webhook
    
    # Copy webhook files
    if [ -f webhook-handler.js ]; then
        cp webhook-handler.js webhook/
        print_status "Webhook handler copied"
    fi
    
    if [ -f webhook-package.json ]; then
        cp webhook-package.json webhook/package.json
        print_status "Webhook package.json copied"
    fi
    
    print_status "Webhook service setup completed"
}

# Setup GitHub Actions
setup_github_actions() {
    print_info "Setting up GitHub Actions workflows..."
    
    # Create .github/workflows directory if it doesn't exist
    mkdir -p .github/workflows
    
    # Check if workflow files exist
    if [ -f .github/workflows/webhook-deploy.yml ]; then
        print_status "Webhook deployment workflow found"
    else
        print_warning "Webhook deployment workflow not found"
    fi
    
    if [ -f .github/workflows/webhook-monitor.yml ]; then
        print_status "Webhook monitoring workflow found"
    else
        print_warning "Webhook monitoring workflow not found"
    fi
    
    print_status "GitHub Actions setup completed"
}

# Setup Docker (optional)
setup_docker() {
    if command -v docker &> /dev/null; then
        print_info "Setting up Docker configuration..."
        
        if [ -f Dockerfile.webhook ]; then
            print_status "Dockerfile.webhook found"
        else
            print_warning "Dockerfile.webhook not found"
        fi
        
        if [ -f docker-compose.webhook.yml ]; then
            print_status "docker-compose.webhook.yml found"
        else
            print_warning "docker-compose.webhook.yml not found"
        fi
        
        print_status "Docker setup completed"
    else
        print_info "Docker not available, skipping Docker setup"
    fi
}

# Test webhook setup
test_webhook() {
    print_info "Testing webhook setup..."
    
    # Test webhook handler syntax
    if [ -f webhook-handler.js ]; then
        if node -c webhook-handler.js; then
            print_status "Webhook handler syntax is valid"
        else
            print_error "Webhook handler has syntax errors"
            return 1
        fi
    fi
    
    # Test webhook test script
    if [ -f webhook-test.js ]; then
        print_info "Webhook test script found"
        print_info "Run 'node webhook-test.js' to test webhook functionality"
    fi
    
    print_status "Webhook setup test completed"
}

# Main setup function
main() {
    echo "Starting webhook setup process..."
    echo ""
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_webhook_service
    setup_github_actions
    setup_docker
    test_webhook
    
    echo ""
    print_status "Webhook setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Update your .env file with actual values"
    echo "2. Configure GitHub secrets for deployment"
    echo "3. Test webhook functionality: node webhook-test.js"
    echo "4. Deploy to Render using the provided configuration"
    echo ""
    print_info "For more information, see WEBHOOK_INTEGRATION.md"
}

# Run main function
main "$@"
