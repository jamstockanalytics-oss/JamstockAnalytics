// Sentiment Analysis Service for JamStockAnalytics
const EventEmitter = require('events');

class SentimentAnalysisService extends EventEmitter {
  constructor() {
    super();
    this.sentimentData = new Map();
    this.newsSentiment = new Map();
    this.marketSentiment = new Map();
    this.socialSentiment = new Map();
    this.sentimentHistory = [];
    this.isRunning = false;
    
    this.initializeSentimentAnalysis();
  }
  
  initializeSentimentAnalysis() {
    console.log('🧠 Initializing Sentiment Analysis Service...');
    
    // Set up sentiment analysis models
    this.setupSentimentModels();
    
    // Start sentiment analysis processes
    this.startSentimentAnalysis();
    
    // Set up periodic sentiment updates
    this.setupPeriodicUpdates();
    
    this.isRunning = true;
    console.log('✅ Sentiment Analysis Service initialized');
  }
  
  setupSentimentModels() {
    // Financial sentiment keywords
    this.sentimentKeywords = {
      positive: [
        'bullish', 'growth', 'profit', 'gain', 'rise', 'increase', 'up', 'strong',
        'positive', 'optimistic', 'confident', 'success', 'win', 'beat', 'exceed',
        'surge', 'rally', 'boom', 'thrive', 'flourish', 'prosper', 'advance',
        'breakthrough', 'milestone', 'record', 'high', 'peak', 'surge', 'momentum'
      ],
      negative: [
        'bearish', 'decline', 'loss', 'fall', 'drop', 'decrease', 'down', 'weak',
        'negative', 'pessimistic', 'concern', 'worry', 'fear', 'risk', 'threat',
        'crash', 'plunge', 'slump', 'recession', 'crisis', 'turmoil', 'volatility',
        'uncertainty', 'instability', 'decline', 'downturn', 'correction', 'sell-off'
      ],
      neutral: [
        'stable', 'unchanged', 'flat', 'steady', 'maintain', 'consistent',
        'balanced', 'moderate', 'normal', 'average', 'regular', 'standard'
      ]
    };
    
    // Market sentiment indicators
    this.marketIndicators = {
      bullish: ['VIX low', 'high volume', 'breakout', 'support', 'resistance break'],
      bearish: ['VIX high', 'low volume', 'breakdown', 'resistance', 'support break'],
      neutral: ['sideways', 'consolidation', 'range-bound', 'stable']
    };
    
    // Social media sentiment patterns
    this.socialPatterns = {
      positive: ['🚀', '📈', '💪', '🔥', '💎', '🎯', '✅', '👍', '💯'],
      negative: ['📉', '💥', '😱', '⚠️', '❌', '👎', '💸', '🔥', '📉'],
      neutral: ['📊', '📋', '📝', 'ℹ️', '🔍', '📌', '📍', '📎']
    };
  }
  
  startSentimentAnalysis() {
    // Analyze news sentiment every 5 minutes
    setInterval(() => {
      this.analyzeNewsSentiment();
    }, 5 * 60 * 1000);
    
    // Analyze market sentiment every 2 minutes
    setInterval(() => {
      this.analyzeMarketSentiment();
    }, 2 * 60 * 1000);
    
    // Analyze social sentiment every 10 minutes
    setInterval(() => {
      this.analyzeSocialSentiment();
    }, 10 * 60 * 1000);
    
    // Generate overall sentiment every 1 minute
    setInterval(() => {
      this.generateOverallSentiment();
    }, 60 * 1000);
  }
  
  setupPeriodicUpdates() {
    // Update sentiment history every hour
    setInterval(() => {
      this.updateSentimentHistory();
    }, 60 * 60 * 1000);
    
    // Clean old sentiment data every 24 hours
    setInterval(() => {
      this.cleanOldSentimentData();
    }, 24 * 60 * 60 * 1000);
  }
  
  // News Sentiment Analysis
  async analyzeNewsSentiment() {
    try {
      console.log('📰 Analyzing news sentiment...');
      
      // Simulate news data analysis
      const newsItems = await this.fetchNewsForAnalysis();
      
      for (const newsItem of newsItems) {
        const sentiment = this.analyzeTextSentiment(newsItem.title + ' ' + newsItem.summary);
        const sentimentScore = this.calculateSentimentScore(sentiment);
        
        const sentimentData = {
          id: newsItem.id,
          title: newsItem.title,
          sentiment: sentiment,
          score: sentimentScore,
          confidence: this.calculateConfidence(sentiment),
          timestamp: new Date().toISOString(),
          source: newsItem.source,
          category: newsItem.category
        };
        
        this.newsSentiment.set(newsItem.id, sentimentData);
        
        // Emit sentiment update
        this.emit('news-sentiment-update', sentimentData);
      }
      
      // Calculate overall news sentiment
      const overallNewsSentiment = this.calculateOverallNewsSentiment();
      this.emit('overall-news-sentiment', overallNewsSentiment);
      
    } catch (error) {
      console.error('❌ Error analyzing news sentiment:', error);
    }
  }
  
  async fetchNewsForAnalysis() {
    // Simulate news data fetch
    return [
      {
        id: Date.now(),
        title: 'JSE Market Shows Strong Performance',
        summary: 'The Jamaica Stock Exchange continues to show strong performance with key indices up.',
        source: 'JSE News',
        category: 'market'
      },
      {
        id: Date.now() + 1,
        title: 'New Investment Opportunities in Jamaica',
        summary: 'Several new investment opportunities have emerged in the Jamaican market.',
        source: 'Financial Times',
        category: 'investment'
      },
      {
        id: Date.now() + 2,
        title: 'Market Volatility Concerns Investors',
        summary: 'Recent market volatility has raised concerns among investors about stability.',
        source: 'Market Watch',
        category: 'market'
      }
    ];
  }
  
  // Market Sentiment Analysis
  async analyzeMarketSentiment() {
    try {
      console.log('📊 Analyzing market sentiment...');
      
      // Simulate market data analysis
      const marketData = await this.fetchMarketDataForAnalysis();
      
      const sentiment = this.analyzeMarketDataSentiment(marketData);
      const sentimentScore = this.calculateMarketSentimentScore(sentiment);
      
      const marketSentimentData = {
        timestamp: new Date().toISOString(),
        sentiment: sentiment,
        score: sentimentScore,
        confidence: this.calculateConfidence(sentiment),
        indicators: this.getMarketIndicators(marketData),
        trends: this.analyzeMarketTrends(marketData)
      };
      
      this.marketSentiment.set('current', marketSentimentData);
      
      // Emit market sentiment update
      this.emit('market-sentiment-update', marketSentimentData);
      
    } catch (error) {
      console.error('❌ Error analyzing market sentiment:', error);
    }
  }
  
  async fetchMarketDataForAnalysis() {
    // Simulate market data fetch
    return {
      totalVolume: Math.floor(Math.random() * 1000000),
      totalValue: Math.floor(Math.random() * 10000000),
      advancingStocks: Math.floor(Math.random() * 50),
      decliningStocks: Math.floor(Math.random() * 50),
      unchangedStocks: Math.floor(Math.random() * 20),
      vix: (Math.random() * 30 + 10).toFixed(2),
      marketCap: Math.floor(Math.random() * 1000000000)
    };
  }
  
  // Social Media Sentiment Analysis
  async analyzeSocialSentiment() {
    try {
      console.log('📱 Analyzing social media sentiment...');
      
      // Simulate social media data analysis
      const socialData = await this.fetchSocialDataForAnalysis();
      
      const sentiment = this.analyzeSocialMediaSentiment(socialData);
      const sentimentScore = this.calculateSocialSentimentScore(sentiment);
      
      const socialSentimentData = {
        timestamp: new Date().toISOString(),
        sentiment: sentiment,
        score: sentimentScore,
        confidence: this.calculateConfidence(sentiment),
        platforms: this.analyzePlatformSentiment(socialData),
        hashtags: this.analyzeHashtagSentiment(socialData)
      };
      
      this.socialSentiment.set('current', socialSentimentData);
      
      // Emit social sentiment update
      this.emit('social-sentiment-update', socialSentimentData);
      
    } catch (error) {
      console.error('❌ Error analyzing social sentiment:', error);
    }
  }
  
  async fetchSocialDataForAnalysis() {
    // Simulate social media data fetch
    return {
      tweets: Math.floor(Math.random() * 1000),
      posts: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 2000),
      shares: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 5000),
      hashtags: ['#JSE', '#JamaicaStock', '#InvestJamaica', '#MarketUpdate']
    };
  }
  
  // Text Sentiment Analysis
  analyzeTextSentiment(text) {
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    
    for (const word of words) {
      if (this.sentimentKeywords.positive.includes(word)) {
        positiveScore++;
      } else if (this.sentimentKeywords.negative.includes(word)) {
        negativeScore++;
      } else if (this.sentimentKeywords.neutral.includes(word)) {
        neutralScore++;
      }
    }
    
    const totalScore = positiveScore + negativeScore + neutralScore;
    
    if (totalScore === 0) {
      return 'neutral';
    }
    
    const positiveRatio = positiveScore / totalScore;
    const negativeRatio = negativeScore / totalScore;
    const neutralRatio = neutralScore / totalScore;
    
    if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
      return 'positive';
    } else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  
  // Market Data Sentiment Analysis
  analyzeMarketDataSentiment(marketData) {
    const indicators = [];
    
    // Volume analysis
    if (marketData.totalVolume > 500000) {
      indicators.push('high_volume');
    } else if (marketData.totalVolume < 100000) {
      indicators.push('low_volume');
    }
    
    // VIX analysis
    if (marketData.vix > 25) {
      indicators.push('high_volatility');
    } else if (marketData.vix < 15) {
      indicators.push('low_volatility');
    }
    
    // Advancing vs declining stocks
    const advancingRatio = marketData.advancingStocks / (marketData.advancingStocks + marketData.decliningStocks);
    if (advancingRatio > 0.6) {
      indicators.push('bullish_momentum');
    } else if (advancingRatio < 0.4) {
      indicators.push('bearish_momentum');
    }
    
    // Determine overall sentiment
    const bullishIndicators = indicators.filter(ind => 
      ['high_volume', 'low_volatility', 'bullish_momentum'].includes(ind)
    ).length;
    
    const bearishIndicators = indicators.filter(ind => 
      ['low_volume', 'high_volatility', 'bearish_momentum'].includes(ind)
    ).length;
    
    if (bullishIndicators > bearishIndicators) {
      return 'positive';
    } else if (bearishIndicators > bullishIndicators) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  
  // Social Media Sentiment Analysis
  analyzeSocialMediaSentiment(socialData) {
    // Simulate social media sentiment analysis
    const engagementScore = (socialData.likes + socialData.shares + socialData.comments) / 1000;
    const activityScore = (socialData.tweets + socialData.posts) / 100;
    
    // Simple sentiment calculation based on engagement and activity
    if (engagementScore > 5 && activityScore > 10) {
      return 'positive';
    } else if (engagementScore < 2 && activityScore < 5) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  
  // Sentiment Score Calculation
  calculateSentimentScore(sentiment) {
    switch (sentiment) {
      case 'positive':
        return Math.random() * 0.4 + 0.6; // 0.6 to 1.0
      case 'negative':
        return Math.random() * 0.4; // 0.0 to 0.4
      case 'neutral':
        return Math.random() * 0.2 + 0.4; // 0.4 to 0.6
      default:
        return 0.5;
    }
  }
  
  calculateMarketSentimentScore(sentiment) {
    switch (sentiment) {
      case 'positive':
        return Math.random() * 0.3 + 0.7; // 0.7 to 1.0
      case 'negative':
        return Math.random() * 0.3; // 0.0 to 0.3
      case 'neutral':
        return Math.random() * 0.2 + 0.4; // 0.4 to 0.6
      default:
        return 0.5;
    }
  }
  
  calculateSocialSentimentScore(sentiment) {
    switch (sentiment) {
      case 'positive':
        return Math.random() * 0.4 + 0.6; // 0.6 to 1.0
      case 'negative':
        return Math.random() * 0.4; // 0.0 to 0.4
      case 'neutral':
        return Math.random() * 0.2 + 0.4; // 0.4 to 0.6
      default:
        return 0.5;
    }
  }
  
  // Confidence Calculation
  calculateConfidence(sentiment) {
    // Simulate confidence calculation
    const baseConfidence = 0.7;
    const variance = Math.random() * 0.3;
    return Math.min(0.95, baseConfidence + variance);
  }
  
  // Overall Sentiment Generation
  generateOverallSentiment() {
    try {
      const newsSentiment = this.calculateOverallNewsSentiment();
      const marketSentiment = this.marketSentiment.get('current');
      const socialSentiment = this.socialSentiment.get('current');
      
      if (!newsSentiment || !marketSentiment || !socialSentiment) {
        return;
      }
      
      const overallScore = (
        newsSentiment.score * 0.4 +
        marketSentiment.score * 0.4 +
        socialSentiment.score * 0.2
      );
      
      const overallSentiment = {
        timestamp: new Date().toISOString(),
        score: overallScore,
        sentiment: this.getSentimentFromScore(overallScore),
        confidence: this.calculateOverallConfidence(newsSentiment, marketSentiment, socialSentiment),
        components: {
          news: newsSentiment,
          market: marketSentiment,
          social: socialSentiment
        },
        trend: this.analyzeSentimentTrend(),
        recommendation: this.generateSentimentRecommendation(overallScore)
      };
      
      this.sentimentData.set('overall', overallSentiment);
      
      // Emit overall sentiment update
      this.emit('overall-sentiment-update', overallSentiment);
      
    } catch (error) {
      console.error('❌ Error generating overall sentiment:', error);
    }
  }
  
  calculateOverallNewsSentiment() {
    const newsItems = Array.from(this.newsSentiment.values());
    if (newsItems.length === 0) {
      return { score: 0.5, sentiment: 'neutral', confidence: 0.5 };
    }
    
    const totalScore = newsItems.reduce((sum, item) => sum + item.score, 0);
    const averageScore = totalScore / newsItems.length;
    
    return {
      score: averageScore,
      sentiment: this.getSentimentFromScore(averageScore),
      confidence: newsItems.reduce((sum, item) => sum + item.confidence, 0) / newsItems.length
    };
  }
  
  getSentimentFromScore(score) {
    if (score >= 0.7) {
      return 'positive';
    } else if (score <= 0.3) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  
  calculateOverallConfidence(newsSentiment, marketSentiment, socialSentiment) {
    return (
      newsSentiment.confidence * 0.4 +
      marketSentiment.confidence * 0.4 +
      socialSentiment.confidence * 0.2
    );
  }
  
  analyzeSentimentTrend() {
    if (this.sentimentHistory.length < 2) {
      return 'stable';
    }
    
    const recent = this.sentimentHistory.slice(-5);
    const trend = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const previous = this.sentimentHistory.slice(-10, -5);
    const previousTrend = previous.reduce((sum, item) => sum + item.score, 0) / previous.length;
    
    if (trend > previousTrend + 0.1) {
      return 'improving';
    } else if (trend < previousTrend - 0.1) {
      return 'declining';
    } else {
      return 'stable';
    }
  }
  
  generateSentimentRecommendation(score) {
    if (score >= 0.8) {
      return {
        action: 'buy',
        confidence: 'high',
        reasoning: 'Strong positive sentiment across all indicators'
      };
    } else if (score >= 0.6) {
      return {
        action: 'hold',
        confidence: 'medium',
        reasoning: 'Moderately positive sentiment, monitor for changes'
      };
    } else if (score >= 0.4) {
      return {
        action: 'hold',
        confidence: 'low',
        reasoning: 'Neutral sentiment, wait for clearer signals'
      };
    } else if (score >= 0.2) {
      return {
        action: 'sell',
        confidence: 'medium',
        reasoning: 'Negative sentiment, consider reducing exposure'
      };
    } else {
      return {
        action: 'sell',
        confidence: 'high',
        reasoning: 'Strong negative sentiment across all indicators'
      };
    }
  }
  
  // Utility Methods
  getMarketIndicators(marketData) {
    return {
      volume: marketData.totalVolume > 500000 ? 'high' : 'low',
      volatility: marketData.vix > 25 ? 'high' : 'low',
      momentum: marketData.advancingStocks > marketData.decliningStocks ? 'positive' : 'negative'
    };
  }
  
  analyzeMarketTrends(marketData) {
    return {
      volume_trend: marketData.totalVolume > 500000 ? 'increasing' : 'decreasing',
      volatility_trend: marketData.vix > 25 ? 'increasing' : 'decreasing',
      momentum_trend: marketData.advancingStocks > marketData.decliningStocks ? 'positive' : 'negative'
    };
  }
  
  analyzePlatformSentiment(socialData) {
    return {
      twitter: Math.random() * 0.4 + 0.3,
      facebook: Math.random() * 0.4 + 0.3,
      linkedin: Math.random() * 0.4 + 0.3,
      instagram: Math.random() * 0.4 + 0.3
    };
  }
  
  analyzeHashtagSentiment(socialData) {
    return socialData.hashtags.map(tag => ({
      tag: tag,
      sentiment: Math.random() * 0.4 + 0.3,
      mentions: Math.floor(Math.random() * 100)
    }));
  }
  
  // History and Cleanup
  updateSentimentHistory() {
    const overallSentiment = this.sentimentData.get('overall');
    if (overallSentiment) {
      this.sentimentHistory.push({
        timestamp: overallSentiment.timestamp,
        score: overallSentiment.score,
        sentiment: overallSentiment.sentiment
      });
      
      // Keep only last 100 entries
      if (this.sentimentHistory.length > 100) {
        this.sentimentHistory = this.sentimentHistory.slice(-100);
      }
    }
  }
  
  cleanOldSentimentData() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Clean old news sentiment
    for (const [id, data] of this.newsSentiment.entries()) {
      if (new Date(data.timestamp) < cutoffTime) {
        this.newsSentiment.delete(id);
      }
    }
    
    // Clean old sentiment history
    this.sentimentHistory = this.sentimentHistory.filter(
      item => new Date(item.timestamp) > cutoffTime
    );
  }
  
  // Public API Methods
  getCurrentSentiment() {
    return {
      overall: this.sentimentData.get('overall'),
      news: this.calculateOverallNewsSentiment(),
      market: this.marketSentiment.get('current'),
      social: this.socialSentiment.get('current')
    };
  }
  
  getSentimentHistory() {
    return this.sentimentHistory;
  }
  
  getSentimentForSymbol(symbol) {
    // Filter sentiment data for specific symbol
    const newsSentiment = Array.from(this.newsSentiment.values())
      .filter(item => item.title.toLowerCase().includes(symbol.toLowerCase()));
    
    return {
      symbol: symbol,
      newsSentiment: newsSentiment,
      overallScore: newsSentiment.reduce((sum, item) => sum + item.score, 0) / newsSentiment.length || 0.5
    };
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      newsSentimentCount: this.newsSentiment.size,
      marketSentimentCount: this.marketSentiment.size,
      socialSentimentCount: this.socialSentiment.size,
      historyCount: this.sentimentHistory.length,
      lastUpdate: this.sentimentData.get('overall')?.timestamp
    };
  }
  
  // Cleanup
  shutdown() {
    console.log('🛑 Shutting down sentiment analysis service...');
    this.isRunning = false;
    this.sentimentData.clear();
    this.newsSentiment.clear();
    this.marketSentiment.clear();
    this.socialSentiment.clear();
    this.sentimentHistory = [];
  }
}

module.exports = SentimentAnalysisService;
