// Hugging Face API Routes for JamStockAnalytics
const express = require('express');
const router = express.Router();
const Sentry = require('@sentry/node');

// Sentiment Analysis
router.post('/sentiment', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for sentiment analysis'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.analyzeSentiment(text, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face sentiment analysis error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/sentiment',
        component: 'huggingface-routes'
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

// Emotion Analysis
router.post('/emotion', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for emotion analysis'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.analyzeEmotion(text, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face emotion analysis error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/emotion',
        component: 'huggingface-routes'
      },
      extra: {
        text: req.body.text,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze emotion'
    });
  }
});

// Financial Sentiment Analysis
router.post('/financial-sentiment', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for financial sentiment analysis'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.analyzeFinancialSentiment(text, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face financial sentiment analysis error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/financial-sentiment',
        component: 'huggingface-routes'
      },
      extra: {
        text: req.body.text,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze financial sentiment'
    });
  }
});

// Text Classification
router.post('/classify', async (req, res) => {
  try {
    const { text, labels, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for text classification'
      });
    }
    
    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({
        success: false,
        message: 'Labels array is required for text classification'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.classifyText(text, labels, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face text classification error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/classify',
        component: 'huggingface-routes'
      },
      extra: {
        text: req.body.text,
        labels: req.body.labels,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to classify text'
    });
  }
});

// Text Summarization
router.post('/summarize', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for summarization'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.summarizeText(text, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face text summarization error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/summarize',
        component: 'huggingface-routes'
      },
      extra: {
        text: req.body.text,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to summarize text'
    });
  }
});

// Question Answering
router.post('/question-answer', async (req, res) => {
  try {
    const { question, context, options = {} } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required for question answering'
      });
    }
    
    if (!context) {
      return res.status(400).json({
        success: false,
        message: 'Context is required for question answering'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.answerQuestion(question, context, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face question answering error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/question-answer',
        component: 'huggingface-routes'
      },
      extra: {
        question: req.body.question,
        context: req.body.context,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to answer question'
    });
  }
});

// Text Generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for text generation'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.generateText(prompt, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face text generation error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/generate',
        component: 'huggingface-routes'
      },
      extra: {
        prompt: req.body.prompt,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to generate text'
    });
  }
});

// Text Embeddings
router.post('/embeddings', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for embeddings generation'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.getEmbeddings(text, options);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face embeddings generation error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/embeddings',
        component: 'huggingface-routes'
      },
      extra: {
        text: req.body.text,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to generate embeddings'
    });
  }
});

// Batch Processing
router.post('/batch', async (req, res) => {
  try {
    const { texts, model, options = {} } = req.body;
    
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: 'Texts array is required for batch processing'
      });
    }
    
    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Model is required for batch processing'
      });
    }
    
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const result = await huggingFaceService.batchProcess(texts, model, options);
    
    res.json({
      success: true,
      data: result,
      count: texts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face batch processing error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'POST /api/huggingface/batch',
        component: 'huggingface-routes'
      },
      extra: {
        texts: req.body.texts,
        model: req.body.model,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to process batch'
    });
  }
});

// Service Status
router.get('/status', async (req, res) => {
  try {
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const status = huggingFaceService.getStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face status error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/huggingface/status',
        component: 'huggingface-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get service status'
    });
  }
});

// Cache Management
router.get('/cache', async (req, res) => {
  try {
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    const cacheStats = huggingFaceService.getCacheStats();
    
    res.json({
      success: true,
      data: cacheStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face cache stats error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'GET /api/huggingface/cache',
        component: 'huggingface-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats'
    });
  }
});

// Clear Cache
router.delete('/cache', async (req, res) => {
  try {
    const huggingFaceService = req.app.locals.huggingFaceService;
    
    if (!huggingFaceService) {
      return res.status(503).json({
        success: false,
        message: 'Hugging Face service not available'
      });
    }
    
    huggingFaceService.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hugging Face cache clear error:', error);
    Sentry.captureException(error, {
      tags: {
        route: 'DELETE /api/huggingface/cache',
        component: 'huggingface-routes'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent')
      }
    });
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

module.exports = router;
