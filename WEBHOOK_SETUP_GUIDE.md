# JamStockAnalytics Webhook Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the JamStockAnalytics webhook infrastructure as specified in CONTEXT.md. The webhook system enables automated deployments and real-time data synchronization.

## Prerequisites

- Node.js 18+ installed
- npm 8+ installed
- Git repository access
- Render.com account (for deployment)
- GitHub account (for workflows)

## Quick Setup

### 1. Automated Setup (Recommended)

**For Linux/macOS:**
```bash
chmod +x webhook-setup.sh
./webhook-setup.sh
```

**For Windows:**
```powershell
.\webhook-setup.ps1
```

### 2. Manual Setup

Follow the step-by-step instructions below for manual setup.

## File Structure

The webhook setup includes the following files:

```
├── webhook-handler.js              # Main webhook service
├── webhook-package.json            # Webhook service dependencies
├── webhook-test.js                 # Integration tests
├── webhook-setup.sh                # Linux/macOS setup script
├── webhook-setup.ps1               # Windows setup script
├── Dockerfile.webhook              # Docker configuration
├── docker-compose.webhook.yml      # Docker Compose configuration
├── render-webhook.yaml             # Render deployment config
├── .github/workflows/
│   ├── webhook-deploy.yml          # Deployment workflow
│   └── webhook-monitor.yml         # Monitoring workflow
└── WEBHOOK_INTEGRATION.md          # Integration documentation
```

## Step-by-Step Setup

### 1. Environment Configuration

Create a `.env` file from the template:

```bash
cp env.example .env
```

Update the following variables in `.env`:

```bash
# Webhook Configuration
WEBHOOK_SECRET=your-secure-webhook-secret
WEBHOOK_PORT=3000
WEBHOOK_URL=https://jamstockanalytics-webhook.onrender.com
MAIN_APP_URL=https://jamstockanalytics-production.onrender.com
```

### 2. Install Dependencies

```bash
# Install main app dependencies
npm install

# Install webhook service dependencies
npm install --prefix webhook
```

### 3. GitHub Actions Setup

The webhook system includes two GitHub Actions workflows:

#### Webhook Deployment Workflow (`.github/workflows/webhook-deploy.yml`)

**Triggers:**
- Push to master/main branches
- Changes to webhook-related files
- Manual workflow dispatch

**Features:**
- Automated testing
- Render deployment
- Health verification
- Slack notifications

#### Webhook Monitoring Workflow (`.github/workflows/webhook-monitor.yml`)

**Triggers:**
- Scheduled every 5 minutes
- Manual workflow dispatch

**Features:**
- Health checks
- Webhook functionality tests
- Performance monitoring
- Alert notifications

### 4. Docker Setup (Optional)

#### Build Webhook Docker Image

```bash
docker build -f Dockerfile.webhook -t jamstockanalytics-webhook .
```

#### Run with Docker Compose

```bash
docker-compose -f docker-compose.webhook.yml up -d
```

#### Monitor Webhook Service

```bash
docker-compose -f docker-compose.webhook.yml logs -f webhook
```

### 5. Render Deployment

#### Deploy Webhook Service

```bash
# Using Render CLI
render deploy --service jamstockanalytics-webhook

# Or using the configuration file
render deploy --config render-webhook.yaml
```

#### Environment Variables on Render

Set the following environment variables in your Render dashboard:

- `WEBHOOK_SECRET`: Your secure webhook secret
- `MAIN_APP_URL`: URL of your main application
- `NODE_ENV`: production
- `WEBHOOK_PORT`: 3000

## Testing

### 1. Local Testing

```bash
# Test webhook handler syntax
node -c webhook-handler.js

# Run integration tests
node webhook-test.js
```

### 2. Health Checks

```bash
# Check webhook health
curl https://jamstockanalytics-webhook.onrender.com/health

# Check main app health
curl https://jamstockanalytics-production.onrender.com/api/health
```

### 3. Webhook Functionality Test

```bash
# Test webhook endpoint
curl -X POST https://jamstockanalytics-webhook.onrender.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=<signature>" \
  -d '{"event": "test", "data": {"test": true}}'
```

## Configuration Files

### 1. Render Configuration (`render-webhook.yaml`)

```yaml
services:
  - type: web
    name: jamstockanalytics-webhook
    env: node
    plan: free
    buildCommand: echo "Dependencies will be installed automatically by Render"
    startCommand: node webhook-handler.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: WEBHOOK_PORT
        value: 3000
      - key: WEBHOOK_SECRET
        sync: false
      - key: MAIN_APP_URL
        value: https://jamstockanalytics-production.onrender.com
    healthCheckPath: /health
    autoDeploy: true
    branch: master
```

### 2. Docker Configuration (`Dockerfile.webhook`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY webhook-package.json package.json
COPY package-lock.json ./
RUN npm ci --only=production
COPY webhook-handler.js ./
RUN addgroup -g 1001 -S nodejs
RUN adduser -S webhook -u 1001
RUN chown -R webhook:nodejs /app
USER webhook
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "webhook-handler.js"]
```

### 3. Docker Compose (`docker-compose.webhook.yml`)

```yaml
version: '3.8'
services:
  webhook:
    build:
      context: .
      dockerfile: Dockerfile.webhook
    container_name: jamstockanalytics-webhook
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - WEBHOOK_PORT=3000
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - MAIN_APP_URL=${MAIN_APP_URL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Monitoring and Maintenance

### 1. Health Monitoring

The webhook system includes comprehensive health monitoring:

- **Health Check Endpoint**: `/health`
- **Automated Monitoring**: Every 5 minutes via GitHub Actions
- **Alert Notifications**: Slack integration for failures

### 2. Logs

```bash
# View webhook logs
docker-compose -f docker-compose.webhook.yml logs -f webhook

# View Render logs
render logs --service jamstockanalytics-webhook
```

### 3. Performance Monitoring

The monitoring workflow includes:
- Response time testing
- Health check validation
- Webhook functionality verification
- Performance metrics collection

## Troubleshooting

### Common Issues

1. **Webhook Signature Mismatch**
   ```bash
   # Verify signature generation
   echo -n '{"event":"test"}' | openssl dgst -sha256 -hmac "your-secret"
   ```

2. **Connection Timeouts**
   ```bash
   # Test connectivity
   curl -v https://jamstockanalytics-webhook.onrender.com/health
   ```

3. **Docker Build Failures**
   ```bash
   # Check Docker logs
   docker build -f Dockerfile.webhook -t jamstockanalytics-webhook . --no-cache
   ```

### Debug Commands

```bash
# Test webhook locally
node webhook-handler.js

# Run integration tests
node webhook-test.js

# Check GitHub Actions
gh run list --workflow=webhook-deploy.yml
gh run list --workflow=webhook-monitor.yml
```

## Security Considerations

1. **Webhook Secret**: Use a strong, unique secret for webhook validation
2. **Environment Variables**: Never commit secrets to version control
3. **Network Security**: Use HTTPS for all webhook communications
4. **Access Control**: Limit webhook endpoint access to trusted sources

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] GitHub Actions workflows set up
- [ ] Docker configuration tested (if using)
- [ ] Render deployment configured
- [ ] Health checks working
- [ ] Webhook functionality tested
- [ ] Monitoring configured
- [ ] Documentation updated

## Support

For webhook setup issues:

1. Check the logs: `docker-compose -f docker-compose.webhook.yml logs`
2. Verify configuration: `node -c webhook-handler.js`
3. Test functionality: `node webhook-test.js`
4. Review GitHub Actions: Check workflow runs
5. Contact development team

## Additional Resources

- [WEBHOOK_INTEGRATION.md](./WEBHOOK_INTEGRATION.md) - Integration documentation
- [CONTEXT.md](./CONTEXT.md) - Project specifications
- [Render Documentation](https://render.com/docs) - Deployment platform
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Workflow automation
