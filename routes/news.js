const express = require('express');
const NewsService = require('../services/news');

const router = express.Router();

// Get latest news
router.get('/', async (req, res) => {
  try {
    const news = await NewsService.fetchLatestNews();
    res.json(news);
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

// Get news by symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const news = await NewsService.getNewsBySymbol(symbol.toUpperCase());
    res.json(news);
  } catch (error) {
    console.error('News by symbol error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news for symbol'
    });
  }
});

// Get news by sentiment
router.get('/sentiment/:sentiment', async (req, res) => {
  try {
    const { sentiment } = req.params;
    const news = await NewsService.fetchLatestNews();
    
    if (news.success) {
      const filteredNews = news.data.filter(item => 
        item.sentiment === sentiment
      );
      res.json({
        success: true,
        data: filteredNews
      });
    } else {
      res.json(news);
    }
  } catch (error) {
    console.error('News by sentiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news by sentiment'
    });
  }
});

module.exports = router;
