const axios = require('axios');

class NewsService {
  static async initialize() {
    // News service initialized
  }

  static async fetchLatestNews() {
    try {
      // Mock news data for now - replace with actual news API
      const mockNews = [
        {
          id: 1,
          title: "Jamaica Stock Exchange Shows Strong Performance",
          summary: "The JSE continues to demonstrate resilience in the current market conditions.",
          source: "Jamaica Observer",
          publishedAt: new Date(),
          sentiment: "positive",
          symbols: ["JSE"]
        },
        {
          id: 2,
          title: "Banking Sector Leads Market Gains",
          summary: "Major banking stocks show significant upward movement.",
          source: "Gleaner",
          publishedAt: new Date(Date.now() - 3600000),
          sentiment: "positive",
          symbols: ["NCB", "SCJ"]
        }
      ];

      return {
        success: true,
        data: mockNews,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('News fetch failed:', error);
      return {
        success: false,
        error: 'Failed to fetch news'
      };
    }
  }

  static async getNewsBySymbol(symbol) {
    try {
      // Mock implementation - replace with actual news filtering
      const news = await this.fetchLatestNews();
      if (news.success) {
        const filteredNews = news.data.filter(item => 
          item.symbols.includes(symbol)
        );
        return {
          success: true,
          data: filteredNews
        };
      }
      return news;
    } catch (error) {
      console.error('News by symbol fetch failed:', error);
      return {
        success: false,
        error: 'Failed to fetch news by symbol'
      };
    }
  }
}

module.exports = NewsService;
