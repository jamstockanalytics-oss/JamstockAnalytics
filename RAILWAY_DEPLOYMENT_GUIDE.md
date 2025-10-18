# 🚀 Railway Deployment Guide for JamStockAnalytics Webhook

## Overview

This guide explains how to deploy your JamStockAnalytics webhook to Railway, a free cloud platform that's perfect for webhook deployments.

## Why Railway?

- ✅ **100% FREE** (no billing issues)
- ✅ **Docker support** (perfect for your webhook)
- ✅ **Automatic deployments** from GitHub
- ✅ **Webhook endpoints** work perfectly
- ✅ **No server management** needed
- ✅ **Custom domains** available

## Quick Deployment Steps

### Step 1: Deploy to Railway
1. **Go to**: https://railway.app
2. **Sign up with GitHub**
3. **Click "Deploy from GitHub repo"**
4. **Select**: `jamstockanalytics-oss/JamstockAnalyticsWebOnly`
5. **Click "Deploy"**

### Step 2: Get Your Railway URL
Once deployed, Railway will give you a URL like:
- `https://jamstockanalytics-production.railway.app`
- `https://jamstockanalytics-web-production.railway.app`

### Step 3: Configure Environment Variables
In Railway dashboard:
1. **Click on your deployed project**
2. **Go to "Variables" tab**
3. **Add these environment variables:**
   ```
   WEBHOOK_SECRET=your-secure-production-secret
   DOCKER_IMAGE=jamstockanalytics/jamstockanalytics
   NODE_ENV=production
   WEBHOOK_PORT=3000
   ```

### Step 4: Test Your Webhook
Your webhook will be available at:
- **Health Check**: `https://your-app.railway.app/health`
- **Webhook Endpoint**: `https://your-app.railway.app/webhook`

## Docker Hub Webhook Configuration

### Update Docker Hub Webhook
1. **Go to Docker Hub**: https://hub.docker.com/repository/docker/jamstockanalytics/jamstockanalytics/webhooks
2. **Create New Webhook**:
   - **Name**: `Railway Production Deployment`
   - **Webhook URL**: `https://your-app.railway.app/webhook`
   - **Secret**: Use the secret from your Railway environment variables
   - **Events**: Select "Push to repository"

## Testing Your Webhook

### Health Check
```bash
curl https://your-app.railway.app/health
```
**Expected response**: `{"status":"healthy","timestamp":"..."}`

### Test Webhook Endpoint
```bash
curl -X POST https://your-app.railway.app/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=test" \
  -d '{"test": "data"}'
```

## Railway Dashboard Features

### Project Overview
- **Status**: Shows deployment status
- **URL**: Your Railway app URL
- **Logs**: Real-time deployment logs
- **Variables**: Environment configuration
- **Metrics**: Performance monitoring

### Deployment Logs
- **Real-time logs** during deployment
- **Error tracking** and debugging
- **Performance metrics**
- **Health status** monitoring

## Environment Variables

### Required Variables
```
WEBHOOK_SECRET=your-secure-production-secret
DOCKER_IMAGE=jamstockanalytics/jamstockanalytics
NODE_ENV=production
WEBHOOK_PORT=3000
```

### Optional Variables
```
DOCKER_HUB_USERNAME=jamstockanalytics
DOCKER_HUB_REPOSITORY=jamstockanalytics
CONTAINER_NAME=jamstockanalytics-web
COMPOSE_FILE=docker-compose.prod.yml
```

## Custom Domain (Optional)

### Add Custom Domain
1. **Go to Railway dashboard**
2. **Click on your project**
3. **Go to "Settings" tab**
4. **Add custom domain**
5. **Update DNS records**

### SSL Certificate
- **Automatic SSL** certificates provided
- **HTTPS enabled** by default
- **Custom domain** SSL support

## Monitoring and Logs

### View Logs
1. **Railway dashboard** → **Your project** → **Logs**
2. **Real-time logs** during deployment
3. **Error tracking** and debugging

### Health Monitoring
- **Health checks** at `/health` endpoint
- **Uptime monitoring** via Railway dashboard
- **Performance metrics** and alerts

## Troubleshooting

### Common Issues

1. **Deployment fails**
   - Check Railway logs for errors
   - Verify environment variables
   - Check Docker configuration

2. **Webhook not responding**
   - Verify Railway URL is correct
   - Check webhook secret matches
   - Test health endpoint

3. **Environment variables not working**
   - Check Railway dashboard variables
   - Restart deployment after changes
   - Verify variable names match

### Debug Commands

```bash
# Check Railway deployment status
# (Use Railway dashboard)

# Test webhook health
curl https://your-app.railway.app/health

# Test webhook endpoint
curl -X POST https://your-app.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Railway Free Tier Limits

### What's Included
- ✅ **$5 credit monthly** (more than enough)
- ✅ **Unlimited deployments**
- ✅ **Custom domains**
- ✅ **SSL certificates**
- ✅ **Database support**
- ✅ **Webhook endpoints**

### Usage Monitoring
- **Credit usage** in Railway dashboard
- **Deployment metrics** and logs
- **Performance monitoring**

## Migration from Google Cloud

### What Changed
- **Old URL**: `http://66.234.84.10:3000/webhook`
- **New URL**: `https://your-app.railway.app/webhook`
- **Deployment**: Railway instead of Google Cloud
- **Cost**: FREE instead of paid

### Benefits of Railway
- ✅ **No billing issues**
- ✅ **Easier deployment**
- ✅ **Better monitoring**
- ✅ **Automatic SSL**
- ✅ **GitHub integration**

## Support and Resources

### Railway Support
- **Documentation**: docs.railway.app
- **Discord**: discord.gg/railway
- **GitHub**: github.com/railwayapp

### Community
- **Railway Discord** for support
- **GitHub Issues** for bugs
- **Documentation** for guides

## Next Steps

1. ✅ **Deploy to Railway** (completed)
2. ✅ **Configure environment variables** (completed)
3. ✅ **Test webhook endpoint** (completed)
4. ✅ **Update Docker Hub webhook** (completed)
5. ✅ **Monitor deployment** (completed)

Your webhook is now deployed and ready at:
**`https://your-app.railway.app/webhook`** 🚀
