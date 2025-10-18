const MarketData = require('../models/MarketData');

class MarketDataService {
  static async initialize() {
    // Market data service initialized
  }

  static async fetchLatestData() {
    try {
      // Fetch latest market data
      const marketData = await MarketData.find({ isActive: true })
        .sort({ lastUpdated: -1 })
        .limit(50)
        .select('symbol name currentPrice change changePercentage sector aiAnalysis');

      return {
        success: true,
        data: marketData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market data fetch failed:', error);
      return {
        success: false,
        error: 'Failed to fetch market data'
      };
    }
  }

  static async getTopPerformers(limit = 10) {
    try {
      const performers = await MarketData.getTopPerformers(limit);
      return {
        success: true,
        data: performers
      };
    } catch (error) {
      console.error('Top performers fetch failed:', error);
      return {
        success: false,
        error: 'Failed to fetch top performers'
      };
    }
  }

  static async getAIRecommendations() {
    try {
      const recommendations = await MarketData.getAIRecommendations();
      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      console.error('AI recommendations fetch failed:', error);
      return {
        success: false,
        error: 'Failed to fetch AI recommendations'
      };
    }
  }
}

module.exports = MarketDataService;
