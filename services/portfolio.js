const User = require('../models/User');

class PortfolioService {
  static async updatePortfolio(userId, portfolio) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update portfolio data
      user.portfolio = {
        ...user.portfolio,
        ...portfolio,
        lastUpdated: new Date()
      };

      // Calculate total value and gains
      if (user.portfolio.holdings && user.portfolio.holdings.length > 0) {
        let totalValue = 0;
        let totalCost = 0;

        user.portfolio.holdings.forEach(holding => {
          const value = holding.shares * holding.currentPrice;
          const cost = holding.shares * holding.averagePrice;
          
          holding.value = value;
          holding.gain = value - cost;
          holding.gainPercentage = cost > 0 ? ((value - cost) / cost) * 100 : 0;
          
          totalValue += value;
          totalCost += cost;
        });

        user.portfolio.totalValue = totalValue;
        user.portfolio.totalGain = totalValue - totalCost;
        user.portfolio.totalGainPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      }

      await user.save();
      
      return {
        success: true,
        data: user.portfolio
      };
    } catch (error) {
      console.error('Portfolio update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getPortfolio(userId) {
    try {
      const user = await User.findById(userId).select('portfolio watchlist');
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          portfolio: user.portfolio,
          watchlist: user.watchlist
        }
      };
    } catch (error) {
      console.error('Portfolio fetch failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async addToWatchlist(userId, symbol, name) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already in watchlist
      const existingItem = user.watchlist.find(item => item.symbol === symbol);
      if (existingItem) {
        throw new Error('Symbol already in watchlist');
      }

      user.watchlist.push({ 
        symbol: symbol.toUpperCase(), 
        name, 
        addedAt: new Date() 
      });
      
      await user.save();
      
      return {
        success: true,
        data: user.watchlist
      };
    } catch (error) {
      console.error('Add to watchlist failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async removeFromWatchlist(userId, symbol) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      user.watchlist = user.watchlist.filter(item => item.symbol !== symbol);
      await user.save();
      
      return {
        success: true,
        data: user.watchlist
      };
    } catch (error) {
      console.error('Remove from watchlist failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getPortfolioPerformance(userId) {
    try {
      const user = await User.findById(userId).select('portfolio');
      
      if (!user) {
        throw new Error('User not found');
      }

      const portfolio = user.portfolio;
      
      // Calculate performance metrics
      const performance = {
        totalValue: portfolio.totalValue || 0,
        totalGain: portfolio.totalGain || 0,
        totalGainPercentage: portfolio.totalGainPercentage || 0,
        holdings: portfolio.holdings || [],
        lastUpdated: portfolio.lastUpdated || new Date()
      };

      return {
        success: true,
        data: performance
      };
    } catch (error) {
      console.error('Portfolio performance fetch failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PortfolioService;
