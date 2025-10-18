const express = require('express');
const MarketData = require('../models/MarketData');
const MarketDataService = require('../services/marketData');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all market data
router.get('/', async (req, res) => {
  try {
    const marketData = await MarketDataService.fetchLatestData();
    res.json(marketData);
  } catch (error) {
    console.error('Market data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data'
    });
  }
});

// Get top performers
router.get('/top-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const performers = await MarketDataService.getTopPerformers(limit);
    res.json(performers);
  } catch (error) {
    console.error('Top performers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers'
    });
  }
});

// Get AI recommendations
router.get('/ai-recommendations', async (req, res) => {
  try {
    const recommendations = await MarketDataService.getAIRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('AI recommendations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI recommendations'
    });
  }
});

// Get market data by symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const marketData = await MarketData.findOne({ 
      symbol: symbol.toUpperCase(),
      isActive: true 
    });
    
    if (!marketData) {
      return res.status(404).json({
        success: false,
        message: 'Market data not found for symbol'
      });
    }
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Market data by symbol error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data for symbol'
    });
  }
});

module.exports = router;
