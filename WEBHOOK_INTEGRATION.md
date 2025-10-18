# JamStockAnalytics Webhook Integration

## Overview

The JamStockAnalytics webhook system provides automated deployment capabilities and real-time data synchronization between services. This document outlines the webhook configuration and integration with all supporting web app functions.

## Architecture

```
External Services → Webhook Handler → Main App → Real-time Updates
     ↓                    ↓              ↓            ↓
  GitHub Push      Webhook Service    Socket.IO    Client Updates
  Docker Build     Market Data        AI Analysis   News Updates
  User Activity    News Updates      Portfolio     Notifications
```

## Webhook Services

### 1. Webhook Handler Service (`webhook-handler.js`)

**Purpose**: Central webhook processing and event distribution

**Endpoints**:
- `GET /health` - Health check
- `POST /webhook` - Main webhook endpoint

**Supported Events**:
- `market_data_update` - Market data changes
- `news_update` - News article updates
- `ai_analysis_complete` - AI analysis results
- `user_activity` - User interactions
- `deployment` - Deployment status updates
- `github_push` - GitHub repository updates
- `docker_build` - Docker image builds

### 2. Main App Webhook Integration (`server.js`)

**Purpose**: Real-time data broadcasting to connected clients

**Endpoints**:
- `POST /api/webhook/market-update` - Market data webhooks
- `POST /api/webhook/news-update` - News update webhooks
- `POST /api/webhook/ai-analysis` - AI analysis webhooks

## Configuration

### Environment Variables

```bash
# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_PORT=3000
WEBHOOK_URL=https://jamstockanalytics-webhook.onrender.com
MAIN_APP_URL=https://jamstockanalytics-production.onrender.com
```

### Render Deployment

**Webhook Service** (`render.yaml`):
```yaml
services:
  - type: web
    name: jamstockanalytics-webhook
    env: node
    plan: free
    buildCommand: echo "Dependencies will be installed automatically by Render"
    startCommand: node webhook-handler.js
    envVars:
      - key: WEBHOOK_PORT
        value: 3000
      - key: WEBHOOK_SECRET
        value: your-webhook-secret
      - key: NODE_ENV
        value: production
      - key: MAIN_APP_URL
        value: https://jamstockanalytics-production.onrender.com
    healthCheckPath: /health
    autoDeploy: true
    branch: master
```

## Web App Functions Integration

### 1. Market Data Updates

**Trigger**: Real-time market data changes
**Webhook**: `POST /webhook` with `event: 'market_data_update'`
**Response**: Broadcasts to all connected clients via Socket.IO

```javascript
// Example webhook payload
{
  "event": "market_data_update",
  "data": {
    "symbol": "NCBFG",
    "price": 95.50,
    "change": 2.3,
    "changePercentage": 2.47,
    "triggerAI": true
  },
  "source": "market_data_service"
}
```

### 2. News Updates

**Trigger**: New news articles or sentiment changes
**Webhook**: `POST /webhook` with `event: 'news_update'`
**Response**: Broadcasts news updates to clients

```javascript
// Example webhook payload
{
  "event": "news_update",
  "data": {
    "title": "NCB Financial Group Reports Strong Q3 Earnings",
    "summary": "NCB Financial Group reported strong third quarter earnings...",
    "sentiment": "positive",
    "symbols": ["NCBFG"],
    "impact": "high"
  },
  "source": "news_service"
}
```

### 3. AI Analysis Results

**Trigger**: AI analysis completion
**Webhook**: `POST /webhook` with `event: 'ai_analysis_complete'`
**Response**: Broadcasts AI recommendations to clients

```javascript
// Example webhook payload
{
  "event": "ai_analysis_complete",
  "data": {
    "symbol": "NCBFG",
    "recommendation": "buy",
    "confidence": 85,
    "priceTarget": 98.50,
    "riskLevel": "medium"
  },
  "source": "ai_service"
}
```

### 4. User Activity Tracking

**Trigger**: User interactions and portfolio updates
**Webhook**: `POST /webhook` with `event: 'user_activity'`
**Response**: Logs activity and triggers personalized recommendations

```javascript
// Example webhook payload
{
  "event": "user_activity",
  "data": {
    "userId": "user123",
    "activity": "portfolio_update",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "source": "user_service"
}
```

## Security

### Webhook Signature Validation

All webhook requests are validated using HMAC-SHA256 signatures:

```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Headers Required

```http
Content-Type: application/json
X-Hub-Signature-256: sha256=<signature>
```

## Testing

### Manual Testing

```bash
# Test webhook health
curl https://jamstockanalytics-webhook.onrender.com/health

# Test webhook endpoint
curl -X POST https://jamstockanalytics-webhook.onrender.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=<signature>" \
  -d '{"event": "market_data_update", "data": {"symbol": "NCBFG", "price": 95.50}}'
```

### Automated Testing

```bash
# Run webhook integration tests
node webhook-test.js
```

## Monitoring

### Health Checks

- **Webhook Service**: `https://jamstockanalytics-webhook.onrender.com/health`
- **Main App**: `https://jamstockanalytics-production.onrender.com/api/health`

### Logs

Webhook events are logged with timestamps and event types for monitoring and debugging.

## Deployment Workflow

1. **Code Push** → GitHub repository
2. **Webhook Trigger** → GitHub webhook to Render
3. **Build Process** → Render builds and deploys
4. **Health Check** → Verify services are running
5. **Webhook Test** → Validate webhook functionality

## Troubleshooting

### Common Issues

1. **Webhook Signature Mismatch**
   - Verify `WEBHOOK_SECRET` is consistent across services
   - Check signature generation algorithm

2. **Connection Timeouts**
   - Verify service URLs are accessible
   - Check network connectivity

3. **Event Processing Failures**
   - Check webhook handler logs
   - Verify event payload format

### Debug Commands

```bash
# Check webhook service status
curl -v https://jamstockanalytics-webhook.onrender.com/health

# Test main app webhook endpoints
curl -X POST https://jamstockanalytics-production.onrender.com/api/webhook/market-update \
  -H "Content-Type: application/json" \
  -d '{"symbol": "TEST", "price": 100.00}'
```

## Integration Checklist

- ✅ Webhook handler service deployed
- ✅ Main app webhook endpoints configured
- ✅ Environment variables set
- ✅ Security signatures implemented
- ✅ Health checks working
- ✅ Real-time updates functioning
- ✅ Error handling in place
- ✅ Monitoring configured
- ✅ Testing procedures documented

## Support

For webhook integration issues:
1. Check service health endpoints
2. Review webhook logs
3. Verify environment configuration
4. Test with webhook-test.js
5. Contact development team
