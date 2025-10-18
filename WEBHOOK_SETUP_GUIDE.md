# Docker Hub Webhook Integration Guide

This guide explains how to set up automated deployments for JamStockAnalytics using Docker Hub webhooks.

## Overview

The webhook integration automatically deploys your application when a new Docker image is pushed to Docker Hub. This includes:

- **Webhook Handler**: Receives notifications from Docker Hub
- **Automated Deployment**: Pulls latest image and updates running containers
- **Health Checks**: Verifies deployment success
- **Rollback Support**: Automatic rollback on deployment failure
- **Backup System**: Creates backups before deployment

## Architecture

```
Docker Hub → Webhook Handler → Deployment Script → Docker Container
     ↓              ↓                ↓                    ↓
  Push Image    Receive Event    Update Container    Verify Health
```

## Prerequisites

- Docker and Docker Compose installed
- Docker Hub repository with webhook support
- Access to the server where you want to deploy

## Quick Setup

### 1. Run the Setup Script

```powershell
# Windows PowerShell
.\scripts\setup-webhook.ps1 -WebhookSecret "your-secure-secret" -DockerHubUsername "jamstockanalytics" -DockerHubRepository "jamstockanalytics"
```

```bash
# Linux/macOS
chmod +x scripts/setup-webhook.sh
./scripts/setup-webhook.sh
```

### 2. Configure Docker Hub Webhook

1. Go to your Docker Hub repository
2. Navigate to **Webhooks** tab
3. Click **Create Webhook**
4. Configure:
   - **Name**: `Production Deployment`
   - **Webhook URL**: `http://YOUR_SERVER_IP:3000/webhook`
   - **Secret**: Use the secret from setup script
   - **Events**: Select "Push to repository"

### 3. Test the Integration

1. Push a new image to Docker Hub:
   ```bash
   docker build -t jamstockanalytics/jamstockanalytics:latest .
   docker push jamstockanalytics/jamstockanalytics:latest
   ```

2. Monitor the deployment:
   ```bash
   # Check webhook logs
   docker logs jamstockanalytics-webhook
   
   # Check application status
   docker ps
   curl http://localhost/
   ```

## Manual Setup

If you prefer manual setup, follow these steps:

### 1. Environment Configuration

Create `.env.webhook` file:
```env
WEBHOOK_SECRET=your-secure-secret-here
DOCKER_HUB_USERNAME=jamstockanalytics
DOCKER_HUB_REPOSITORY=jamstockanalytics
DOCKER_IMAGE=jamstockanalytics/jamstockanalytics
CONTAINER_NAME=jamstockanalytics-web
COMPOSE_FILE=docker-compose.prod.yml
```

### 2. Build Webhook Handler

```bash
docker build -f Dockerfile.webhook -t jamstockanalytics-webhook .
```

### 3. Start Webhook Handler

```bash
docker-compose -f docker-compose.webhook.yml up -d
```

### 4. Configure Docker Hub

Add webhook in Docker Hub repository settings:
- **URL**: `http://YOUR_SERVER_IP:3000/webhook`
- **Secret**: Your webhook secret
- **Events**: Push to repository

## File Structure

```
├── .github/workflows/
│   └── docker-deploy.yml          # GitHub Actions CI/CD
├── scripts/
│   ├── webhook-handler.js         # Node.js webhook receiver
│   ├── deploy-on-webhook.sh      # Linux deployment script
│   ├── deploy-on-webhook.ps1     # Windows deployment script
│   └── setup-webhook.ps1         # Setup automation
├── docker-compose.webhook.yml     # Webhook handler service
├── Dockerfile.webhook             # Webhook handler container
└── WEBHOOK_SETUP_GUIDE.md        # This guide
```

## Configuration Options

### Webhook Handler Settings

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `WEBHOOK_PORT` | Port for webhook handler | `3000` |
| `WEBHOOK_SECRET` | Secret for webhook verification | Required |
| `NODE_ENV` | Node.js environment | `production` |

### Deployment Settings

| Variable | Description | Default |
|-----------|-------------|---------|
| `DOCKER_IMAGE` | Docker image to deploy | `jamstockanalytics/jamstockanalytics` |
| `CONTAINER_NAME` | Container name | `jamstockanalytics-web` |
| `COMPOSE_FILE` | Docker Compose file | `docker-compose.prod.yml` |

## Security Considerations

### Webhook Security
- Always use a strong, unique webhook secret
- Verify webhook signatures in production
- Use HTTPS for webhook URLs in production
- Restrict webhook handler access to trusted networks

### Container Security
- Run containers as non-root user
- Use read-only filesystems where possible
- Regularly update base images
- Monitor container logs for suspicious activity

## Monitoring and Logs

### View Webhook Logs
```bash
docker logs jamstockanalytics-webhook -f
```

### Check Deployment Status
```bash
# Container status
docker ps -a

# Application health
curl http://localhost/health

# Docker Compose status
docker-compose -f docker-compose.prod.yml ps
```

### Health Checks
- **Webhook Handler**: `http://localhost:3000/health`
- **Application**: `http://localhost/`
- **Container Health**: Docker health checks

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check Docker Hub webhook configuration

2. **Deployment fails**
   - Check Docker daemon is running
   - Verify image exists in Docker Hub
   - Check deployment script permissions

3. **Container won't start**
   - Check port conflicts
   - Verify Docker Compose configuration
   - Check container logs

### Debug Commands

```bash
# Check webhook handler status
docker ps | grep webhook

# View webhook logs
docker logs jamstockanalytics-webhook

# Test webhook endpoint
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check deployment script
docker exec jamstockanalytics-webhook ls -la /app/scripts/
```

## Advanced Configuration

### Custom Deployment Scripts

You can customize deployment behavior by modifying:
- `scripts/deploy-on-webhook.sh` (Linux)
- `scripts/deploy-on-webhook.ps1` (Windows)

### Multiple Environments

For multiple environments, create separate configurations:
```bash
# Development
docker-compose -f docker-compose.webhook.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.webhook.yml -f docker-compose.prod.yml up -d
```

### Load Balancing

For high availability, use multiple webhook handlers behind a load balancer:
```yaml
# docker-compose.webhook.yml
services:
  webhook-handler-1:
    # ... configuration
  webhook-handler-2:
    # ... configuration
  nginx:
    # Load balancer configuration
```

## Support

For issues and questions:
1. Check the logs: `docker logs jamstockanalytics-webhook`
2. Review this guide
3. Check Docker Hub webhook configuration
4. Verify network connectivity

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS for webhook URLs in production
2. **Rotate Secrets**: Regularly rotate webhook secrets
3. **Network Security**: Restrict access to webhook handler
4. **Monitor Logs**: Regularly review webhook and deployment logs
5. **Backup Strategy**: Implement proper backup and recovery procedures
