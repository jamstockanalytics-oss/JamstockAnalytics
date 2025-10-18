const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.WEBHOOK_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Webhook secret validation
const validateWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('WARNING: No webhook secret configured');
    return next();
  }
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  const providedSignature = signature.replace('sha256=', '');
  
  if (!crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  )) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'jamstockanalytics-webhook',
    status: 'running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      webhook: '/webhook'
    },
    documentation: 'https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'jamstockanalytics-webhook',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main webhook endpoint
app.post('/webhook', validateWebhookSignature, async (req, res) => {
  try {
    const { event, data, source } = req.body;
    
    console.log(`Webhook received: ${event} from ${source || 'unknown'}`);
    
    // Handle different webhook events
    switch (event) {
      case 'market_data_update':
        await handleMarketDataUpdate(data);
        break;
        
      case 'news_update':
        await handleNewsUpdate(data);
        break;
        
      case 'ai_analysis_complete':
        await handleAIAnalysisComplete(data);
        break;
        
      case 'user_activity':
        await handleUserActivity(data);
        break;
        
      case 'deployment':
        await handleDeployment(data);
        break;
        
      case 'github_push':
        await handleGitHubPush(data);
        break;
        
      case 'docker_build':
        await handleDockerBuild(data);
        break;
        
      default:
        console.log(`Unknown webhook event: ${event}`);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Market data update handler
async function handleMarketDataUpdate(data) {
  try {
    console.log('Processing market data update:', data.symbol);
    
    // Trigger real-time updates to connected clients
    await notifyClients('market_update', {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      timestamp: new Date().toISOString()
    });
    
    // Update AI analysis if needed
    if (data.triggerAI) {
      await triggerAIAnalysis(data.symbol);
    }
    
  } catch (error) {
    console.error('Market data update error:', error);
  }
}

// News update handler
async function handleNewsUpdate(data) {
  try {
    console.log('Processing news update:', data.title);
    
    // Trigger real-time news updates
    await notifyClients('news_update', {
      title: data.title,
      summary: data.summary,
      sentiment: data.sentiment,
      timestamp: new Date().toISOString()
    });
    
    // Trigger AI analysis for news impact
    if (data.symbols && data.symbols.length > 0) {
      await triggerNewsImpactAnalysis(data);
    }
    
  } catch (error) {
    console.error('News update error:', error);
  }
}

// AI analysis complete handler
async function handleAIAnalysisComplete(data) {
  try {
    console.log('Processing AI analysis complete:', data.symbol);
    
    // Notify clients of AI analysis results
    await notifyClients('ai_analysis', {
      symbol: data.symbol,
      recommendation: data.recommendation,
      confidence: data.confidence,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI analysis complete error:', error);
  }
}

// User activity handler
async function handleUserActivity(data) {
  try {
    console.log('Processing user activity:', data.userId);
    
    // Log user activity for analytics
    await logUserActivity(data);
    
    // Trigger personalized recommendations
    if (data.activity === 'portfolio_update') {
      await triggerPersonalizedRecommendations(data.userId);
    }
    
  } catch (error) {
    console.error('User activity error:', error);
  }
}

// Deployment handler
async function handleDeployment(data) {
  try {
    console.log('Processing deployment:', data.service);
    
    // Update deployment status
    await updateDeploymentStatus(data);
    
    // Notify monitoring systems
    await notifyMonitoringSystems(data);
    
  } catch (error) {
    console.error('Deployment error:', error);
  }
}

// GitHub push handler
async function handleGitHubPush(data) {
  try {
    console.log('Processing GitHub push:', data.repository);
    
    // Trigger automated deployment
    await triggerAutomatedDeployment(data);
    
  } catch (error) {
    console.error('GitHub push error:', error);
  }
}

// Docker build handler
async function handleDockerBuild(data) {
  try {
    console.log('Processing Docker build:', data.image);
    
    // Update container registry
    await updateContainerRegistry(data);
    
    // Trigger deployment
    await triggerContainerDeployment(data);
    
  } catch (error) {
    console.error('Docker build error:', error);
  }
}

// Helper functions
async function notifyClients(event, data) {
  try {
    // This would integrate with your main app's Socket.IO instance
    // For now, we'll just log the notification
    console.log(`Notifying clients: ${event}`, data);
    
    // In a real implementation, you'd send this to your main app
    // via HTTP request or message queue
    
  } catch (error) {
    console.error('Client notification error:', error);
  }
}

async function triggerAIAnalysis(symbol) {
  try {
    // Trigger AI analysis for the symbol
    console.log(`Triggering AI analysis for ${symbol}`);
    
    // This would call your AI service
    // await AIService.analyzeStock(symbol);
    
  } catch (error) {
    console.error('AI analysis trigger error:', error);
  }
}

async function triggerNewsImpactAnalysis(newsData) {
  try {
    // Analyze news impact on stocks
    console.log('Triggering news impact analysis:', newsData.symbols);
    
  } catch (error) {
    console.error('News impact analysis error:', error);
  }
}

async function logUserActivity(activityData) {
  try {
    // Log user activity for analytics
    console.log('Logging user activity:', activityData);
    
  } catch (error) {
    console.error('User activity logging error:', error);
  }
}

async function triggerPersonalizedRecommendations(userId) {
  try {
    // Generate personalized recommendations
    console.log(`Triggering personalized recommendations for user ${userId}`);
    
  } catch (error) {
    console.error('Personalized recommendations error:', error);
  }
}

async function updateDeploymentStatus(deploymentData) {
  try {
    // Update deployment status in database
    console.log('Updating deployment status:', deploymentData);
    
  } catch (error) {
    console.error('Deployment status update error:', error);
  }
}

async function notifyMonitoringSystems(deploymentData) {
  try {
    // Notify monitoring systems of deployment
    console.log('Notifying monitoring systems:', deploymentData);
    
  } catch (error) {
    console.error('Monitoring notification error:', error);
  }
}

async function triggerAutomatedDeployment(pushData) {
  try {
    // Trigger automated deployment based on GitHub push
    console.log('Triggering automated deployment:', pushData);
    
  } catch (error) {
    console.error('Automated deployment error:', error);
  }
}

async function updateContainerRegistry(buildData) {
  try {
    // Update container registry with new image
    console.log('Updating container registry:', buildData);
    
  } catch (error) {
    console.error('Container registry update error:', error);
  }
}

async function triggerContainerDeployment(buildData) {
  try {
    // Trigger container deployment
    console.log('Triggering container deployment:', buildData);
    
  } catch (error) {
    console.error('Container deployment error:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Webhook error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Endpoint '${req.method} ${req.path}' not found`,
    availableEndpoints: {
      'GET /': 'Service information',
      'GET /health': 'Health check',
      'POST /webhook': 'Webhook endpoint'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Webhook handler running on port ${PORT}`);
  console.log(`🌍 Host: 0.0.0.0`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Version: ${process.env.npm_package_version || '1.0.0'}`);
}).on('error', (err) => {
  console.error('❌ Failed to start webhook handler:', err);
  process.exit(1);
});

// Configure server timeouts for Render.com
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 120000;   // 2 minutes

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down webhook handler');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down webhook handler');
  process.exit(0);
});

module.exports = app;
