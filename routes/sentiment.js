// Sentiment Analysis Routes for JamStockAnalytics
const express = require('express');
const router = express.Router();
const Sentry = require('@sentry/node');

// Get overall sentiment
router.get('/overall', async (req, res) => {
  try {
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const sentiment = sentimentService.getCurrentSentiment();
    
    res.json({
      success: true,
      data: sentiment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sentiment overall error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/overall',
        component: 'sentiment-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get overall sentiment'
    });
  }
});

// Get news sentiment
router.get('/news', async (req, res) => {
  try {
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const newsSentiment = sentimentService.calculateOverallNewsSentiment();
    
    res.json({
      success: true,
      data: newsSentiment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('News sentiment error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/news',
        component: 'sentiment-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get news sentiment'
    });
  }
});

// Get market sentiment
router.get('/market', async (req, res) => {
  try {
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const marketSentiment = sentimentService.marketSentiment.get('current');
    
    if (!marketSentiment) {
      return res.status(404).json({
        success: false,
        message: 'Market sentiment data not available'
      });
    }
    
    res.json({
      success: true,
      data: marketSentiment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Market sentiment error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/market',
        component: 'sentiment-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get market sentiment'
    });
  }
});

// Get social sentiment
router.get('/social', async (req, res) => {
  try {
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const socialSentiment = sentimentService.socialSentiment.get('current');
    
    if (!socialSentiment) {
      return res.status(404).json({
        success: false,
        message: 'Social sentiment data not available'
      });
    }
    
    res.json({
      success: true,
      data: socialSentiment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Social sentiment error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/social',
        component: 'sentiment-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get social sentiment'
    });
  }
});

// Get sentiment for specific symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const symbolSentiment = sentimentService.getSentimentForSymbol(symbol);
    
    res.json({
      success: true,
      data: symbolSentiment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Symbol sentiment error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/symbol/:symbol',
        component: 'sentiment-routes'
      },
      extra: {
        symbol: req.params.symbol,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get symbol sentiment'
    });
  }
});

// Get sentiment history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, timeframe = '24h' } = req.query;
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    let history = sentimentService.getSentimentHistory();
    
    // Apply timeframe filter
    const now = new Date();
    let cutoffTime;
    
    switch (timeframe) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    history = history.filter(item => new Date(item.timestamp) > cutoffTime);
    
    // Apply limit
    history = history.slice(-parseInt(limit));
    
    res.json({
      success: true,
      data: history,
      timeframe: timeframe,
      limit: parseInt(limit),
      count: history.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sentiment history error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/history',
        component: 'sentiment-routes'
      },
      extra: {
        limit: req.query.limit,
        timeframe: req.query.timeframe,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get sentiment history'
    });
  }
});

// Get sentiment status
router.get('/status', async (req, res) => {
  try {
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const status = sentimentService.getStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sentiment status error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/sentiment/status',
        component: 'sentiment-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get sentiment status'
    });
  }
});

// Analyze custom text sentiment
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for sentiment analysis'
      });
    }
    
    const sentimentService = req.app.locals.sentimentService;
    
    if (!sentimentService) {
      return res.status(503).json({
        success: false,
        message: 'Sentiment analysis service not available'
      });
    }
    
    const sentiment = sentimentService.analyzeTextSentiment(text);
    const score = sentimentService.calculateSentimentScore(sentiment);
    const confidence = sentimentService.calculateConfidence(sentiment);
    
    res.json({
      success: true,
      data: {
        text: text,
        sentiment: sentiment,
        score: score,
        confidence: confidence,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Custom sentiment analysis error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/sentiment/analyze',
        component: 'sentiment-routes'
      },
      extra: {
        text: req.body.text,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment'
    });
  }
});

module.exports = router;
