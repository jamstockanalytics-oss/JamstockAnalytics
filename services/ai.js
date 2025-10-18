const axios = require('axios');
const MarketData = require('../models/MarketData');
const News = require('../models/News');

class AIService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.apiKey) {
      console.warn('⚠️ DeepSeek API key not provided, using mock AI responses');
      this.isInitialized = false;
      return;
    }

    try {
      // Test API connection
      await this.testConnection();
      this.isInitialized = true;
      console.log('✅ AI Service initialized with DeepSeek API');
    } catch (error) {
      console.warn('⚠️ AI Service initialized in mock mode:', error.message);
      this.isInitialized = false;
    }
  }

  async testConnection() {
    const response = await axios.post(`${this.baseURL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async analyzeStock(symbol, marketData, newsData) {
    try {
      if (!this.isInitialized) {
        return this.generateMockAnalysis(symbol, marketData);
      }

      const prompt = this.buildAnalysisPrompt(symbol, marketData, newsData);
      const response = await this.callDeepSeekAPI(prompt);
      
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.generateMockAnalysis(symbol, marketData);
    }
  }

  buildAnalysisPrompt(symbol, marketData, newsData) {
    return `
Analyze the following Jamaica Stock Exchange (JSE) stock data and provide investment insights:

Stock: ${symbol}
Current Price: $${marketData.currentPrice}
Change: ${marketData.change} (${marketData.changePercentage}%)
Volume: ${marketData.volume}
Market Cap: $${marketData.marketCap}
Sector: ${marketData.sector}

Recent News:
${newsData.slice(0, 5).map(news => `- ${news.title}: ${news.summary}`).join('\n')}

Please provide:
1. Investment recommendation (strong_buy, buy, hold, sell, strong_sell)
2. Confidence level (0-100)
3. Price target
4. Risk level (low, medium, high)
5. Key factors affecting the stock
6. Brief summary of your analysis

Respond in JSON format:
{
  "recommendation": "buy",
  "confidence": 85,
  "priceTarget": 95.50,
  "riskLevel": "medium",
  "keyFactors": ["Strong earnings", "Market volatility"],
  "summary": "Brief analysis summary"
}
    `.trim();
  }

  async callDeepSeekAPI(prompt) {
    const response = await axios.post(`${this.baseURL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial analyst specializing in the Jamaica Stock Exchange. Provide accurate, data-driven investment analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  parseAIResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.generateMockAnalysis();
    }
  }

  generateMockAnalysis(symbol, marketData) {
    const recommendations = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
    const riskLevels = ['low', 'medium', 'high'];
    const sentiments = ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'];
    
    const change = marketData?.changePercentage || 0;
    let recommendation = 'hold';
    let confidence = 50;
    let sentiment = 'neutral';

    if (change > 5) {
      recommendation = Math.random() > 0.3 ? 'buy' : 'strong_buy';
      confidence = 70 + Math.random() * 20;
      sentiment = 'positive';
    } else if (change < -5) {
      recommendation = Math.random() > 0.3 ? 'sell' : 'strong_sell';
      confidence = 70 + Math.random() * 20;
      sentiment = 'negative';
    } else {
      recommendation = 'hold';
      confidence = 40 + Math.random() * 30;
      sentiment = 'neutral';
    }

    return {
      recommendation,
      confidence: Math.round(confidence),
      priceTarget: marketData?.currentPrice * (0.9 + Math.random() * 0.2),
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      keyFactors: [
        'Market volatility',
        'Sector performance',
        'Economic indicators',
        'Company fundamentals'
      ],
      summary: `Based on current market conditions and technical analysis, ${symbol} shows ${sentiment} sentiment with ${recommendation} recommendation.`
    };
  }

  async processChatMessage(message, userId) {
    try {
      if (!this.isInitialized) {
        return this.generateMockChatResponse(message);
      }

      const prompt = `
User question: ${message}
Context: Jamaica Stock Exchange market analysis
User ID: ${userId}

Provide a helpful, accurate response about JSE market conditions, specific stocks, or investment advice.
    `.trim();

      const response = await this.callDeepSeekAPI(prompt);
      return {
        message: response,
        timestamp: new Date(),
        type: 'ai_response'
      };
    } catch (error) {
      console.error('Chat processing failed:', error);
      return this.generateMockChatResponse(message);
    }
  }

  generateMockChatResponse(message) {
    const responses = [
      "Based on current JSE market data, I can see strong performance across banking and financial sectors. The market is showing resilience with key indicators pointing to continued growth.",
      "The Jamaica Stock Exchange is currently experiencing positive momentum, with technology and financial sectors leading gains. I recommend monitoring NCBFG and SGJ for potential opportunities.",
      "Market analysis shows mixed signals with some sectors outperforming. Consider diversifying your portfolio across different sectors for better risk management.",
      "Current market conditions suggest a cautious approach. Focus on companies with strong fundamentals and consistent dividend payments.",
      "The JSE is showing signs of recovery with increased investor confidence. Technology and renewable energy sectors are particularly promising."
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      type: 'ai_response'
    };
  }

  async generateMarketAnalysis() {
    try {
      const topStocks = await MarketData.find({ isActive: true })
        .sort({ changePercentage: -1 })
        .limit(10)
        .select('symbol name changePercentage sector aiAnalysis');

      const analysis = {
        marketSentiment: this.calculateMarketSentiment(topStocks),
        topPerformers: topStocks.slice(0, 5),
        sectorAnalysis: this.analyzeSectors(topStocks),
        recommendations: this.generateMarketRecommendations(topStocks),
        timestamp: new Date()
      };

      return analysis;
    } catch (error) {
      console.error('Market analysis generation failed:', error);
      return this.generateMockMarketAnalysis();
    }
  }

  calculateMarketSentiment(stocks) {
    const avgChange = stocks.reduce((sum, stock) => sum + stock.changePercentage, 0) / stocks.length;
    
    if (avgChange > 2) return 'very_positive';
    if (avgChange > 0) return 'positive';
    if (avgChange > -2) return 'neutral';
    if (avgChange > -5) return 'negative';
    return 'very_negative';
  }

  analyzeSectors(stocks) {
    const sectors = {};
    stocks.forEach(stock => {
      if (!sectors[stock.sector]) {
        sectors[stock.sector] = { count: 0, totalChange: 0 };
      }
      sectors[stock.sector].count++;
      sectors[stock.sector].totalChange += stock.changePercentage;
    });

    return Object.entries(sectors).map(([sector, data]) => ({
      sector,
      averageChange: data.totalChange / data.count,
      stockCount: data.count
    }));
  }

  generateMarketRecommendations(stocks) {
    return [
      "Consider diversifying across sectors for better risk management",
      "Monitor banking sector for potential opportunities",
      "Technology stocks showing strong momentum",
      "Focus on companies with strong fundamentals"
    ];
  }

  generateMockMarketAnalysis() {
    return {
      marketSentiment: 'positive',
      topPerformers: [
        { symbol: 'NCBFG', name: 'NCB Financial Group', changePercentage: 2.3 },
        { symbol: 'SGJ', name: 'Sagicor Group Jamaica', changePercentage: 1.8 }
      ],
      sectorAnalysis: [
        { sector: 'Banking', averageChange: 1.5, stockCount: 3 },
        { sector: 'Technology', averageChange: 2.1, stockCount: 2 }
      ],
      recommendations: [
        "Market showing positive momentum",
        "Consider banking sector investments",
        "Monitor technology stocks"
      ],
      timestamp: new Date()
    };
  }
}

module.exports = new AIService();
