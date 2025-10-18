const express = require('express');
const AIService = require('../services/ai');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get AI analysis
router.get('/analysis', async (req, res) => {
  try {
    const analysis = await AIService.generateMarketAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI analysis'
    });
  }
});

// Chat with AI
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const response = await AIService.processChatMessage(message, userId);
    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI chat message'
    });
  }
});

// Get AI recommendations for user
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recommendations = await AIService.getUserRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI recommendations'
    });
  }
});

// Analyze specific stock
router.post('/analyze-stock', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.user.userId;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }
    
    const analysis = await AIService.analyzeStock(symbol, userId);
    res.json(analysis);
  } catch (error) {
    console.error('Stock analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze stock'
    });
  }
});

module.exports = router;
