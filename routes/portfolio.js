const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user portfolio
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('portfolio watchlist');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        portfolio: user.portfolio,
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    });
  }
});

// Update portfolio
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { portfolio } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.portfolio = portfolio;
    await user.save();
    
    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: user.portfolio
    });
  } catch (error) {
    console.error('Portfolio update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio'
    });
  }
});

// Add to watchlist
router.post('/watchlist', authMiddleware, async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already in watchlist
    const existingItem = user.watchlist.find(item => item.symbol === symbol);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Symbol already in watchlist'
      });
    }
    
    user.watchlist.push({ symbol, name, addedAt: new Date() });
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to watchlist successfully',
      data: user.watchlist
    });
  } catch (error) {
    console.error('Watchlist add error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to watchlist'
    });
  }
});

// Remove from watchlist
router.delete('/watchlist/:symbol', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.watchlist = user.watchlist.filter(item => item.symbol !== symbol);
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from watchlist successfully',
      data: user.watchlist
    });
  } catch (error) {
    console.error('Watchlist remove error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watchlist'
    });
  }
});

module.exports = router;
