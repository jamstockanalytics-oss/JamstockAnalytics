# Sentry Setup Guide for JamStockAnalytics

## Overview
Sentry provides real-time error tracking, performance monitoring, and debugging for your JamStockAnalytics application.

## Step 1: Create Sentry Account
1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project:
   - **Platform**: Node.js
   - **Project Name**: "JamStockAnalytics"
   - **Team**: Create or join a team

## Step 2: Get Your DSN
After creating the project, you'll get a **DSN** (Data Source Name) that looks like:
```
https://your-key@sentry.io/project-id
```

## Step 3: Configure Environment Variables
Add your Sentry DSN to your environment variables:

### For Development (.env file):
```bash
SENTRY_DSN=https://your-key@sentry.io/project-id
NODE_ENV=development
```

### For Production (Render):
1. Go to your Render dashboard
2. Navigate to your service
3. Go to Environment tab
4. Add new environment variable:
   - **Key**: `SENTRY_DSN`
   - **Value**: `https://your-key@sentry.io/project-id`

## Step 4: Install Dependencies
The Sentry packages have been added to your `package.json`:
- `@sentry/node`: Core Sentry SDK for Node.js
- `@sentry/profiling-node`: Performance profiling

Install them:
```bash
npm install
```

## Step 5: Configuration Details

### What's Already Configured:
✅ **Error Tracking**: Automatic capture of unhandled exceptions and promise rejections
✅ **Performance Monitoring**: Request tracing and performance metrics
✅ **Profiling**: CPU and memory profiling for performance optimization
✅ **Custom Error Tracking**: Added to market routes with context
✅ **Environment Detection**: Different sampling rates for development vs production

### Sampling Rates:
- **Development**: 100% sampling (captures everything)
- **Production**: 10% sampling (optimized for performance)

## Step 6: Testing Sentry Integration

### Test Error Tracking:
1. Start your server: `npm start`
2. Make a request to an endpoint that might fail
3. Check your Sentry dashboard for the error

### Test Performance Monitoring:
1. Make several requests to your API endpoints
2. Check the Performance tab in Sentry dashboard
3. View request traces and performance metrics

## Step 7: Custom Error Tracking

### Manual Error Reporting:
```javascript
const Sentry = require('@sentry/node');

// Capture an exception
Sentry.captureException(error, {
  tags: {
    route: 'GET /api/market/data',
    component: 'market-routes'
  },
  extra: {
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent')
  }
});

// Capture a message
Sentry.captureMessage('Something went wrong', 'error');
```

### Add User Context:
```javascript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username
});
```

## Step 8: Monitoring Features

### Error Tracking:
- Real-time error notifications
- Error grouping and deduplication
- Stack traces with source maps
- User context and breadcrumbs

### Performance Monitoring:
- Request duration tracking
- Database query performance
- External API call monitoring
- Memory and CPU usage profiling

### Alerts and Notifications:
- Email notifications for new errors
- Slack integration (optional)
- Custom alert rules
- Release tracking

## Step 9: Production Deployment

### Render Configuration:
1. Add `SENTRY_DSN` environment variable
2. Deploy your application
3. Monitor the Sentry dashboard for errors and performance

### Health Checks:
- Monitor error rates
- Track response times
- Set up alerts for critical issues

## Troubleshooting

### Common Issues:
1. **No errors showing**: Check DSN configuration
2. **High error volume**: Adjust sampling rates
3. **Performance impact**: Reduce sampling rates in production

### Debug Mode:
Set `NODE_ENV=development` to see detailed Sentry logs in console.

## Next Steps:
1. Set up alert rules for critical errors
2. Configure release tracking
3. Add custom performance metrics
4. Set up team notifications

## Support:
- [Sentry Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry Community](https://forum.sentry.io/)
- [Sentry Status](https://status.sentry.io/)
