# Webhook Monitoring Guide

## Health Checks

### Basic Health Check
```bash
curl https://jamstockanalytics-webhook.onrender.com/health
```

### Expected Response
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T07:19:24.254Z"
}
```

## Monitoring Endpoints

- **Health**: `https://jamstockanalytics-webhook.onrender.com/health`
- **Webhook**: `https://jamstockanalytics-webhook.onrender.com/webhook`

## Render Dashboard Monitoring

1. **Go to**: https://dashboard.render.com
2. **Select your webhook service**
3. **Check logs** for webhook activity
4. **Monitor metrics** for performance

## Docker Hub Webhook Status

1. **Go to**: https://hub.docker.com/repository/docker/jamstockanalytics/jamstockanalytics
2. **Click "Webhooks" tab**
3. **Check webhook status** and recent activity
4. **View webhook logs** for any errors

## Testing the Pipeline

### Manual Test
```bash
# Push a new image to trigger webhook
docker tag jamstockanalytics/jamstockanalytics:latest jamstockanalytics/jamstockanalytics:test-$(date +%Y%m%d-%H%M%S)
docker push jamstockanalytics/jamstockanalytics:test-$(date +%Y%m%d-%H%M%S)
```

### Expected Flow
1. Image pushed to Docker Hub
2. Docker Hub sends webhook to Render
3. Render webhook processes the request
4. Check Render logs for activity

## Troubleshooting

### Webhook Not Triggering
- Check Docker Hub webhook configuration
- Verify webhook URL is correct
- Check Render service status
- Review Render logs for errors

### Webhook Errors
- Check signature verification
- Verify webhook secret matches
- Review Render service logs
- Test webhook endpoint manually

## Production Checklist

- [ ] Webhook health check responding
- [ ] Docker Hub webhook configured
- [ ] Webhook secret matches
- [ ] Render service running
- [ ] Pipeline tested end-to-end
- [ ] Monitoring set up
- [ ] Alerts configured (optional)
