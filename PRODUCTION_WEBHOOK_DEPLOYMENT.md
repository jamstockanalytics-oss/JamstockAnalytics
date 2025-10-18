# Production Webhook Deployment Guide

## Overview

This guide will help you deploy the JamStockAnalytics webhook handler to your production server at `66.234.84.10:3000`.

## Prerequisites

- Access to your production server (66.234.84.10)
- Docker and Docker Compose installed on the production server
- SSH access to the server
- Port 3000 open on the server firewall

## Deployment Steps

### 1. Prepare Your Production Server

SSH into your production server:
```bash
ssh user@66.234.84.10
```

### 2. Install Docker (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
exit
ssh user@66.234.84.10
```

### 3. Clone Your Repository

```bash
# Clone your repository
git clone https://github.com/your-username/JamStockAnalytics.git
cd JamStockAnalytics
```

### 4. Deploy the Webhook Handler

```bash
# Make the deployment script executable
chmod +x deploy-production-webhook.ps1

# Run the production deployment script
./deploy-production-webhook.ps1 -WebhookSecret "your-secure-production-secret" -ProductionIP "66.234.84.10"
```

### 5. Verify Deployment

```bash
# Check if the webhook handler is running
docker ps | grep webhook

# Test the health endpoint
curl http://66.234.84.10:3000/health

# Check webhook logs
docker logs jamstockanalytics-webhook
```

### 6. Configure Docker Hub Webhook

1. Go to your Docker Hub repository: https://hub.docker.com/repository/docker/jamstockanalytics/jamstockanalytics
2. Navigate to the **Webhooks** tab
3. Click **Create Webhook**
4. Configure:
   - **Name**: `Production Deployment`
   - **Webhook URL**: `http://66.234.84.10:3000/webhook`
   - **Secret**: Use the secret you set in the deployment script
   - **Events**: Select "Push to repository"

### 7. Test the Integration

```bash
# Push a new image to Docker Hub
docker build -t jamstockanalytics/jamstockanalytics:latest .
docker push jamstockanalytics/jamstockanalytics:latest

# Monitor the deployment
docker logs jamstockanalytics-webhook -f
```

## Security Configuration

### Firewall Setup

```bash
# Allow port 3000 through firewall
sudo ufw allow 3000/tcp
sudo ufw reload
```

### SSL/HTTPS Setup (Recommended)

For production, consider using a reverse proxy with SSL:

```bash
# Install nginx
sudo apt install nginx

# Create nginx configuration
sudo nano /etc/nginx/sites-available/jamstockanalytics
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 66.234.84.10;

    location /webhook {
        proxy_pass http://localhost:3000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/jamstockanalytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check webhook health
curl http://66.234.84.10:3000/health

# Check container status
docker ps

# View logs
docker logs jamstockanalytics-webhook
```

### Log Rotation

```bash
# Set up log rotation for Docker containers
sudo nano /etc/logrotate.d/docker-containers
```

Add:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

### Backup Strategy

```bash
# Backup webhook configuration
tar -czf webhook-backup-$(date +%Y%m%d).tar.gz .env.webhook docker-compose.webhook.yml scripts/
```

## Troubleshooting

### Common Issues

1. **Webhook not accessible**
   - Check firewall: `sudo ufw status`
   - Check if container is running: `docker ps`
   - Check logs: `docker logs jamstockanalytics-webhook`

2. **Docker Hub webhook not triggering**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Test with curl: `curl -X POST http://66.234.84.10:3000/webhook`

3. **Deployment fails**
   - Check Docker daemon: `sudo systemctl status docker`
   - Check disk space: `df -h`
   - Check container logs: `docker logs jamstockanalytics-webhook`

### Debug Commands

```bash
# Check webhook handler status
docker ps | grep webhook

# View detailed logs
docker logs jamstockanalytics-webhook --details

# Test webhook endpoint manually
curl -X POST http://66.234.84.10:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=test" \
  -d '{"test": "data"}'

# Check system resources
htop
df -h
free -h
```

## Production Checklist

- [ ] Docker and Docker Compose installed
- [ ] Repository cloned on production server
- [ ] Webhook handler deployed and running
- [ ] Port 3000 accessible from internet
- [ ] Docker Hub webhook configured
- [ ] Health endpoint responding
- [ ] Test deployment successful
- [ ] Log monitoring set up
- [ ] Backup strategy implemented
- [ ] Security measures in place

## Support

If you encounter issues:

1. Check the logs: `docker logs jamstockanalytics-webhook`
2. Verify network connectivity
3. Check Docker Hub webhook configuration
4. Review this guide for troubleshooting steps

Your production webhook will be available at: `http://66.234.84.10:3000/webhook`
