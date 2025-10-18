// Real-time service for JamStockAnalytics
const EventEmitter = require('events');
const cron = require('node-cron');

class RealtimeService extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.connectedClients = new Map();
    this.marketData = new Map();
    this.newsData = [];
    this.aiInsights = [];
    this.portfolioUpdates = new Map();
    this.isRunning = false;
    
    this.initializeRealtime();
  }
  
  initializeRealtime() {
    console.log('🚀 Initializing real-time service...');
    
    // Set up Socket.IO connection handling
    this.setupSocketHandlers();
    
    // Start real-time data updates
    this.startDataUpdates();
    
    // Set up periodic tasks
    this.setupPeriodicTasks();
    
    this.isRunning = true;
    console.log('✅ Real-time service initialized');
  }
  
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📱 Client connected: ${socket.id}`);
      
      // Store client information
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        subscriptions: new Set(),
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address
      });
      
      // Handle client subscriptions
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });
      
      // Handle client unsubscriptions
      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });
      
      // Handle client requests
      socket.on('request-data', (data) => {
        this.handleDataRequest(socket, data);
      });
      
      // Handle client disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
      
      // Send initial data to new client
      this.sendInitialData(socket);
    });
  }
  
  handleSubscription(socket, data) {
    const { type, symbol, userId } = data;
    const client = this.connectedClients.get(socket.id);
    
    if (!client) return;
    
    // Add to client subscriptions
    client.subscriptions.add(`${type}:${symbol || 'all'}`);
    
    // Join appropriate rooms
    socket.join(`${type}:${symbol || 'all'}`);
    if (userId) {
      socket.join(`user:${userId}`);
    }
    
    console.log(`📊 Client ${socket.id} subscribed to ${type}:${symbol || 'all'}`);
    
    // Send current data for this subscription
    this.sendCurrentData(socket, type, symbol);
  }
  
  handleUnsubscription(socket, data) {
    const { type, symbol } = data;
    const client = this.connectedClients.get(socket.id);
    
    if (!client) return;
    
    // Remove from client subscriptions
    client.subscriptions.delete(`${type}:${symbol || 'all'}`);
    
    // Leave appropriate rooms
    socket.leave(`${type}:${symbol || 'all'}`);
    
    console.log(`📊 Client ${socket.id} unsubscribed from ${type}:${symbol || 'all'}`);
  }
  
  handleDataRequest(socket, data) {
    const { type, symbol, timeframe } = data;
    
    switch (type) {
      case 'market-data':
        this.sendMarketData(socket, symbol, timeframe);
        break;
      case 'news':
        this.sendNewsData(socket, symbol);
        break;
      case 'ai-insights':
        this.sendAIInsights(socket, symbol);
        break;
      case 'portfolio':
        this.sendPortfolioData(socket, data.userId);
        break;
      default:
        console.log(`❓ Unknown data request type: ${type}`);
    }
  }
  
  handleDisconnection(socket) {
    console.log(`📱 Client disconnected: ${socket.id}`);
    this.connectedClients.delete(socket.id);
  }
  
  sendInitialData(socket) {
    // Send welcome message
    socket.emit('welcome', {
      message: 'Connected to JamStockAnalytics real-time service',
      timestamp: new Date().toISOString(),
      features: ['market-data', 'news', 'ai-insights', 'portfolio']
    });
    
    // Send current market overview
    socket.emit('market-overview', this.getMarketOverview());
    
    // Send recent news
    socket.emit('recent-news', this.newsData.slice(0, 5));
    
    // Send AI insights
    socket.emit('ai-insights', this.aiInsights.slice(0, 3));
  }
  
  sendCurrentData(socket, type, symbol) {
    switch (type) {
      case 'market-data':
        this.sendMarketData(socket, symbol);
        break;
      case 'news':
        this.sendNewsData(socket, symbol);
        break;
      case 'ai-insights':
        this.sendAIInsights(socket, symbol);
        break;
    }
  }
  
  startDataUpdates() {
    // Market data updates every 5 seconds
    setInterval(() => {
      this.updateMarketData();
    }, 5000);
    
    // News updates every 30 seconds
    setInterval(() => {
      this.updateNewsData();
    }, 30000);
    
    // AI insights updates every 2 minutes
    setInterval(() => {
      this.updateAIInsights();
    }, 120000);
    
    // Portfolio updates every 10 seconds
    setInterval(() => {
      this.updatePortfolioData();
    }, 10000);
  }
  
  setupPeriodicTasks() {
    // Market data refresh every minute
    cron.schedule('* * * * *', () => {
      this.refreshMarketData();
    });
    
    // News refresh every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.refreshNewsData();
    });
    
    // AI insights refresh every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.refreshAIInsights();
    });
    
    // Portfolio refresh every minute
    cron.schedule('* * * * *', () => {
      this.refreshPortfolioData();
    });
  }
  
  // Market Data Methods
  async updateMarketData() {
    try {
      const marketData = await this.fetchMarketData();
      
      // Update internal cache
      this.marketData.set('current', marketData);
      
      // Broadcast to all subscribed clients
      this.io.to('market-data:all').emit('market-update', {
        type: 'market-data',
        data: marketData,
        timestamp: new Date().toISOString()
      });
      
      // Broadcast to specific symbol subscribers
      for (const [symbol, data] of marketData.symbols) {
        this.io.to(`market-data:${symbol}`).emit('market-update', {
          type: 'market-data',
          symbol: symbol,
          data: data,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Error updating market data:', error);
    }
  }
  
  async fetchMarketData() {
    // Simulate market data fetch
    const symbols = ['JSE', 'NCBFG', 'SJ', 'BIL', 'CAC'];
    const marketData = {
      timestamp: new Date().toISOString(),
      marketStatus: 'open',
      totalVolume: Math.floor(Math.random() * 1000000),
      totalValue: Math.floor(Math.random() * 10000000),
      symbols: new Map()
    };
    
    for (const symbol of symbols) {
      const price = (Math.random() * 100 + 50).toFixed(2);
      const change = (Math.random() * 10 - 5).toFixed(2);
      const changePercent = (Math.random() * 20 - 10).toFixed(2);
      
      marketData.symbols.set(symbol, {
        symbol: symbol,
        price: parseFloat(price),
        change: parseFloat(change),
        changePercent: parseFloat(changePercent),
        volume: Math.floor(Math.random() * 100000),
        high: parseFloat(price) + Math.random() * 5,
        low: parseFloat(price) - Math.random() * 5,
        open: parseFloat(price) + (Math.random() - 0.5) * 2,
        timestamp: new Date().toISOString()
      });
    }
    
    return marketData;
  }
  
  getMarketOverview() {
    return {
      totalSymbols: this.marketData.get('current')?.symbols?.size || 0,
      marketStatus: 'open',
      lastUpdate: new Date().toISOString()
    };
  }
  
  sendMarketData(socket, symbol, timeframe = '1m') {
    const data = this.marketData.get('current');
    if (data) {
      if (symbol && data.symbols.has(symbol)) {
        socket.emit('market-data', {
          symbol: symbol,
          data: data.symbols.get(symbol),
          timeframe: timeframe,
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit('market-data', {
          data: data,
          timeframe: timeframe,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  // News Methods
  async updateNewsData() {
    try {
      const newsData = await this.fetchNewsData();
      
      // Update internal cache
      this.newsData = newsData;
      
      // Broadcast to all subscribed clients
      this.io.to('news:all').emit('news-update', {
        type: 'news',
        data: newsData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error updating news data:', error);
    }
  }
  
  async fetchNewsData() {
    // Simulate news data fetch
    const newsItems = [
      {
        id: Date.now(),
        title: 'JSE Market Shows Strong Performance',
        summary: 'The Jamaica Stock Exchange continues to show strong performance with key indices up.',
        source: 'JSE News',
        timestamp: new Date().toISOString(),
        category: 'market',
        sentiment: 'positive'
      },
      {
        id: Date.now() + 1,
        title: 'New Investment Opportunities in Jamaica',
        summary: 'Several new investment opportunities have emerged in the Jamaican market.',
        source: 'Financial Times',
        timestamp: new Date().toISOString(),
        category: 'investment',
        sentiment: 'neutral'
      }
    ];
    
    return newsItems;
  }
  
  sendNewsData(socket, symbol) {
    const filteredNews = symbol 
      ? this.newsData.filter(news => news.symbol === symbol)
      : this.newsData;
    
    socket.emit('news-data', {
      data: filteredNews,
      symbol: symbol,
      timestamp: new Date().toISOString()
    });
  }
  
  // AI Insights Methods
  async updateAIInsights() {
    try {
      const aiInsights = await this.fetchAIInsights();
      
      // Update internal cache
      this.aiInsights = aiInsights;
      
      // Broadcast to all subscribed clients
      this.io.to('ai-insights:all').emit('ai-insights-update', {
        type: 'ai-insights',
        data: aiInsights,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error updating AI insights:', error);
    }
  }
  
  async fetchAIInsights() {
    // Simulate AI insights fetch
    const insights = [
      {
        id: Date.now(),
        type: 'market-analysis',
        title: 'Market Trend Analysis',
        content: 'Based on current market data, we predict a bullish trend for the next quarter.',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        symbols: ['JSE', 'NCBFG']
      },
      {
        id: Date.now() + 1,
        type: 'risk-assessment',
        title: 'Risk Assessment Update',
        content: 'Current market volatility is within normal ranges.',
        confidence: 0.92,
        timestamp: new Date().toISOString(),
        symbols: ['SJ', 'BIL']
      }
    ];
    
    return insights;
  }
  
  sendAIInsights(socket, symbol) {
    const filteredInsights = symbol 
      ? this.aiInsights.filter(insight => insight.symbols?.includes(symbol))
      : this.aiInsights;
    
    socket.emit('ai-insights-data', {
      data: filteredInsights,
      symbol: symbol,
      timestamp: new Date().toISOString()
    });
  }
  
  // Portfolio Methods
  async updatePortfolioData() {
    try {
      // Get all connected clients with portfolio subscriptions
      const portfolioClients = Array.from(this.connectedClients.values())
        .filter(client => client.subscriptions.has('portfolio:all'));
      
      for (const client of portfolioClients) {
        const portfolioData = await this.fetchPortfolioData(client.userId);
        this.io.to(client.id).emit('portfolio-update', {
          type: 'portfolio',
          data: portfolioData,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Error updating portfolio data:', error);
    }
  }
  
  async fetchPortfolioData(userId) {
    // Simulate portfolio data fetch
    return {
      userId: userId,
      totalValue: Math.floor(Math.random() * 100000),
      totalGain: Math.floor(Math.random() * 10000),
      totalGainPercent: (Math.random() * 20 - 10).toFixed(2),
      positions: [
        {
          symbol: 'JSE',
          quantity: 100,
          currentPrice: 25.50,
          totalValue: 2550,
          gain: 150,
          gainPercent: 6.25
        },
        {
          symbol: 'NCBFG',
          quantity: 50,
          currentPrice: 45.75,
          totalValue: 2287.50,
          gain: -50,
          gainPercent: -2.14
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
  
  sendPortfolioData(socket, userId) {
    const portfolioData = this.portfolioUpdates.get(userId);
    if (portfolioData) {
      socket.emit('portfolio-data', {
        data: portfolioData,
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Refresh Methods
  async refreshMarketData() {
    console.log('🔄 Refreshing market data...');
    await this.updateMarketData();
  }
  
  async refreshNewsData() {
    console.log('🔄 Refreshing news data...');
    await this.updateNewsData();
  }
  
  async refreshAIInsights() {
    console.log('🔄 Refreshing AI insights...');
    await this.updateAIInsights();
  }
  
  async refreshPortfolioData() {
    console.log('🔄 Refreshing portfolio data...');
    await this.updatePortfolioData();
  }
  
  // Utility Methods
  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }
  
  getClientCount() {
    return this.connectedClients.size;
  }
  
  getSubscriptionCount() {
    let totalSubscriptions = 0;
    for (const client of this.connectedClients.values()) {
      totalSubscriptions += client.subscriptions.size;
    }
    return totalSubscriptions;
  }
  
  // Broadcast Methods
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }
  
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
  
  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
  
  // Status Methods
  getStatus() {
    return {
      isRunning: this.isRunning,
      connectedClients: this.getClientCount(),
      totalSubscriptions: this.getSubscriptionCount(),
      lastMarketUpdate: this.marketData.get('current')?.timestamp,
      lastNewsUpdate: this.newsData[0]?.timestamp,
      lastAIUpdate: this.aiInsights[0]?.timestamp
    };
  }
  
  // Cleanup
  shutdown() {
    console.log('🛑 Shutting down real-time service...');
    this.isRunning = false;
    this.connectedClients.clear();
    this.marketData.clear();
    this.newsData = [];
    this.aiInsights = [];
    this.portfolioUpdates.clear();
  }
}

module.exports = RealtimeService;
