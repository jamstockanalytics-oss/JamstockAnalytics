# 🐳 Docker Setup for JamStockAnalytics

This document explains how to use Docker with the JamStockAnalytics Expo React Native project.

## 📁 Project Structure

```
JamStockAnalytics/
├── Dockerfile                 # Main Docker configuration
├── docker-compose.yml        # Development environment
├── .dockerignore             # Docker build optimization
├── .github/workflows/        # CI/CD pipelines
│   ├── ci.yml               # Main CI pipeline
│   ├── docker.yml           # Docker-specific pipeline
│   └── verify-expo-token.yml # Expo token verification
└── JamStockAnalytics/        # Main app directory
    ├── package.json
    └── ... (app files)
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)
```bash
# Start development environment
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Using Docker directly
```bash
# Build the image
docker build -t jamstockanalytics .

# Run the container
docker run -p 8081:8081 jamstockanalytics
```

## 🔧 Configuration Files

### Dockerfile
- **Base Image**: Node.js 18 Alpine (lightweight)
- **Working Directory**: `/app`
- **Port**: 8081 (Expo development server)
- **Command**: `npx expo start --web`

### docker-compose.yml
- **Ports**: 8081, 19000-19002 (Expo services)
- **Volumes**: Live code reloading
- **Environment**: Proper networking for containers

### .dockerignore
- Excludes `node_modules`, build artifacts
- Optimizes build performance
- Reduces image size

## 🏗️ CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **ci.yml** - Main CI Pipeline
- **Triggers**: Push to main/master, PRs
- **Jobs**:
  - Test: Node.js tests
  - Docker Build: Build and test Docker image
  - Expo Build: Build for web/Android/iOS
  - Deploy: Production deployment

#### 2. **docker.yml** - Docker-specific Pipeline
- **Triggers**: Changes to Docker files
- **Features**:
  - Multi-platform builds (AMD64/ARM64)
  - Security scanning with Trivy
  - Docker Hub integration
  - docker-compose validation

#### 3. **verify-expo-token.yml** - Expo Token Verification
- **Trigger**: Manual dispatch
- **Purpose**: Verify EXPO_TOKEN configuration
- **Checks**: Token presence, Expo CLI, authentication

## 🔐 Required Secrets

Add these to your GitHub repository secrets:

### For Docker Hub (Optional)
```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-token
```

### For Expo Builds
```
EXPO_TOKEN=your-expo-token
```

## 📊 Available Ports

| Port | Service | Description |
|------|---------|-------------|
| 8081 | Expo Dev Server | Main development server |
| 19000 | Expo DevTools | Development tools |
| 19001 | Expo Metro | Metro bundler |
| 19002 | Expo Tunnel | Tunnel service |

## 🛠️ Development Commands

```bash
# Build and run
docker-compose up --build

# Run specific service
docker-compose up jamstockanalytics

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec jamstockanalytics npm run setup-database

# Clean up
docker-compose down -v
```

## 🚀 Production Deployment

### Docker Image
```bash
# Build production image
docker build -t jamstockanalytics:latest .

# Run production container
docker run -d -p 8081:8081 --name jamstockanalytics jamstockanalytics:latest
```

### Docker Compose Production
```yaml
version: '3.8'
services:
  jamstockanalytics:
    image: jamstockanalytics:latest
    ports:
      - "8081:8081"
    environment:
      - NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 8081
   netstat -tulpn | grep 8081
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs jamstockanalytics
   
   # Debug container
   docker-compose exec jamstockanalytics sh
   ```

3. **Build failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove all containers/images
   docker system prune -a
   ```

### Debug Commands
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f jamstockanalytics

# Access container shell
docker-compose exec jamstockanalytics sh

# Check Docker image
docker images jamstockanalytics
```

## 📈 Performance Optimization

### Build Optimization
- Uses `.dockerignore` to exclude unnecessary files
- Multi-stage builds for smaller images
- Layer caching for faster rebuilds

### Runtime Optimization
- Alpine Linux for minimal footprint
- Node.js 18 for performance
- Proper port mapping for Expo services

## 🔒 Security Features

- **Trivy Security Scanning**: Vulnerability detection
- **Multi-platform builds**: AMD64/ARM64 support
- **Non-root user**: Security best practices
- **Minimal base image**: Reduced attack surface

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [React Native Docker](https://reactnative.dev/docs/environment-setup)
