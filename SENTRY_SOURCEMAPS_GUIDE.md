# Sentry Source Maps Setup Guide

## Overview
This guide explains how to set up source maps for your JamStockAnalytics application to get better error tracking and debugging in Sentry.

## What's Been Configured

### 1. Sentry Configuration File
- **`.sentryclirc`** - Sentry CLI configuration
- **Organization**: jam-stock-analytics
- **Project**: node-b0

### 2. Webpack Configuration
- **`webpack.config.js`** - Webpack setup with Sentry plugin
- **Source maps enabled** - For better error tracking
- **Sentry webpack plugin** - Automatic source map upload

### 3. Package.json Scripts
- **`npm run build`** - Standard webpack build
- **`npm run build:sentry`** - Build with Sentry release tracking

## Setup Steps

### Step 1: Get Your Sentry Auth Token
1. Go to [https://sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)
2. Create a new auth token with these scopes:
   - `project:releases`
   - `org:read`
   - `project:read`
3. Copy the token

### Step 2: Set Environment Variables
Add these to your environment:

**For Development (.env file):**
```bash
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_RELEASE=jamstockanalytics@1.0.0
```

**For Production (Render):**
1. Go to your Render service
2. Environment tab
3. Add these variables:
   - `SENTRY_AUTH_TOKEN` = `your-auth-token-here`
   - `SENTRY_RELEASE` = `jamstockanalytics@1.0.0`

### Step 3: Build with Source Maps
```bash
# Standard build
npm run build

# Build with Sentry release tracking
npm run build:sentry
```

## What Source Maps Provide

### Better Error Tracking
- **Exact line numbers** in stack traces
- **Original source code** context
- **Function names** and variable names
- **File paths** to original source files

### Debugging Benefits
- **Minified code** gets mapped back to original
- **TypeScript** source maps (if using TS)
- **ES6+ features** properly mapped
- **Webpack bundles** properly tracked

## Production Deployment

### Render Configuration
Your `render-production.yaml` is already configured with:
- `SENTRY_DSN` environment variable
- Build and start commands

### Build Process
1. **Install dependencies**: `npm install`
2. **Build with source maps**: `npm run build:sentry`
3. **Start application**: `npm start`

## Troubleshooting

### Common Issues
1. **Auth token missing**: Set `SENTRY_AUTH_TOKEN` environment variable
2. **Release not found**: Ensure `SENTRY_RELEASE` is set
3. **Source maps not uploading**: Check webpack build output

### Debug Commands
```bash
# Check Sentry CLI configuration
npx @sentry/cli info

# Test source map upload
npx @sentry/cli releases files jamstockanalytics@1.0.0 upload-sourcemaps ./dist
```

## Benefits for Your Application

### Error Tracking
- **Precise stack traces** showing exact line numbers
- **Source code context** for each error
- **Function call hierarchy** properly mapped

### Performance Monitoring
- **Transaction traces** with source code context
- **Database query** source location
- **API endpoint** source mapping

### Development Workflow
- **Local debugging** with source maps
- **Production errors** mapped to source code
- **Release tracking** with source maps

## Next Steps

1. **Set up auth token** in your environment
2. **Test build process** with `npm run build:sentry`
3. **Deploy to production** with source maps
4. **Monitor errors** in Sentry dashboard with full source context

## Support
- [Sentry Source Maps Documentation](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry Webpack Plugin](https://docs.sentry.io/platforms/javascript/guides/webpack/)
- [Sentry CLI Documentation](https://docs.sentry.io/product/cli/)
