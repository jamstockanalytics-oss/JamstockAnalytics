// Real-time client for JamStockAnalytics
class RealtimeClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.subscriptions = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    this.eventHandlers = {
      market: new Map(),
      news: new Map(),
      ai: new Map(),
      portfolio: new Map(),
      system: new Map()
    };
    
    this.initialize();
  }
  
  initialize() {
    this.connect();
    this.setupEventListeners();
    this.setupReconnection();
  }
  
  connect() {
    try {
      this.socket = io();
      
      this.socket.on('connect', () => {
        console.log('🔌 Connected to real-time service');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('system:connected');
        
        // Resubscribe to previous subscriptions
        this.resubscribe();
      });
      
      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from real-time service');
        this.isConnected = false;
        this.emit('system:disconnected');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.emit('system:error', error);
      });
      
      // Set up real-time event handlers
      this.setupRealtimeHandlers();
      
    } catch (error) {
      console.error('❌ Failed to initialize real-time client:', error);
    }
  }
  
  setupRealtimeHandlers() {
    // Market data handlers
    this.socket.on('market-update', (data) => {
      this.handleMarketUpdate(data);
    });
    
    this.socket.on('market-data', (data) => {
      this.emit('market:data', data);
    });
    
    this.socket.on('market-overview', (data) => {
      this.emit('market:overview', data);
    });
    
    // News handlers
    this.socket.on('news-update', (data) => {
      this.handleNewsUpdate(data);
    });
    
    this.socket.on('news-data', (data) => {
      this.emit('news:data', data);
    });
    
    this.socket.on('recent-news', (data) => {
      this.emit('news:recent', data);
    });
    
    // AI insights handlers
    this.socket.on('ai-insights-update', (data) => {
      this.handleAIInsightsUpdate(data);
    });
    
    this.socket.on('ai-insights-data', (data) => {
      this.emit('ai:insights', data);
    });
    
    this.socket.on('ai-insights', (data) => {
      this.emit('ai:insights', data);
    });
    
    // Portfolio handlers
    this.socket.on('portfolio-update', (data) => {
      this.handlePortfolioUpdate(data);
    });
    
    this.socket.on('portfolio-data', (data) => {
      this.emit('portfolio:data', data);
    });
    
    // System handlers
    this.socket.on('welcome', (data) => {
      this.emit('system:welcome', data);
    });
  }
  
  setupEventListeners() {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
    
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.emit('system:online');
      this.reconnect();
    });
    
    window.addEventListener('offline', () => {
      this.emit('system:offline');
    });
  }
  
  setupReconnection() {
    this.socket.on('disconnect', () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}`);
          this.socket.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });
  }
  
  // Subscription methods
  subscribe(type, symbol = null, userId = null) {
    if (!this.isConnected) {
      console.warn('⚠️ Not connected to real-time service');
      return;
    }
    
    const subscriptionKey = `${type}:${symbol || 'all'}`;
    this.subscriptions.add(subscriptionKey);
    
    this.socket.emit('subscribe', {
      type: type,
      symbol: symbol,
      userId: userId
    });
    
    console.log(`📊 Subscribed to ${subscriptionKey}`);
  }
  
  unsubscribe(type, symbol = null) {
    if (!this.isConnected) {
      return;
    }
    
    const subscriptionKey = `${type}:${symbol || 'all'}`;
    this.subscriptions.delete(subscriptionKey);
    
    this.socket.emit('unsubscribe', {
      type: type,
      symbol: symbol
    });
    
    console.log(`📊 Unsubscribed from ${subscriptionKey}`);
  }
  
  resubscribe() {
    for (const subscription of this.subscriptions) {
      const [type, symbol] = subscription.split(':');
      this.socket.emit('subscribe', {
        type: type,
        symbol: symbol === 'all' ? null : symbol
      });
    }
  }
  
  // Event handling methods
  on(event, handler) {
    const [category, action] = event.split(':');
    if (!this.eventHandlers[category]) {
      this.eventHandlers[category] = new Map();
    }
    this.eventHandlers[category].set(action, handler);
  }
  
  off(event) {
    const [category, action] = event.split(':');
    if (this.eventHandlers[category]) {
      this.eventHandlers[category].delete(action);
    }
  }
  
  emit(event, data) {
    const [category, action] = event.split(':');
    if (this.eventHandlers[category] && this.eventHandlers[category].has(action)) {
      const handler = this.eventHandlers[category].get(action);
      try {
        handler(data);
      } catch (error) {
        console.error(`❌ Error in event handler for ${event}:`, error);
      }
    }
  }
  
  // Data handling methods
  handleMarketUpdate(data) {
    this.emit('market:update', data);
    
    // Update UI elements
    this.updateMarketUI(data);
  }
  
  handleNewsUpdate(data) {
    this.emit('news:update', data);
    
    // Update UI elements
    this.updateNewsUI(data);
  }
  
  handleAIInsightsUpdate(data) {
    this.emit('ai:update', data);
    
    // Update UI elements
    this.updateAIUI(data);
  }
  
  handlePortfolioUpdate(data) {
    this.emit('portfolio:update', data);
    
    // Update UI elements
    this.updatePortfolioUI(data);
  }
  
  // UI update methods
  updateMarketUI(data) {
    // Update market data display
    const marketElements = document.querySelectorAll('[data-market]');
    marketElements.forEach(element => {
      const field = element.dataset.market;
      if (data.data && data.data[field]) {
        element.textContent = data.data[field];
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 1000);
      }
    });
    
    // Update symbol-specific data
    if (data.symbol && data.data) {
      const symbolElements = document.querySelectorAll(`[data-symbol="${data.symbol}"]`);
      symbolElements.forEach(element => {
        const field = element.dataset.field;
        if (data.data[field]) {
          element.textContent = data.data[field];
          element.classList.add('updated');
          setTimeout(() => element.classList.remove('updated'), 1000);
        }
      });
    }
  }
  
  updateNewsUI(data) {
    // Update news feed
    const newsContainer = document.getElementById('news-feed');
    if (newsContainer && data.data) {
      data.data.forEach(newsItem => {
        this.addNewsItem(newsItem);
      });
    }
  }
  
  updateAIUI(data) {
    // Update AI insights
    const aiContainer = document.getElementById('ai-insights');
    if (aiContainer && data.data) {
      data.data.forEach(insight => {
        this.addAIInsight(insight);
      });
    }
  }
  
  updatePortfolioUI(data) {
    // Update portfolio display
    const portfolioElements = document.querySelectorAll('[data-portfolio]');
    portfolioElements.forEach(element => {
      const field = element.dataset.portfolio;
      if (data.data && data.data[field]) {
        element.textContent = data.data[field];
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 1000);
      }
    });
  }
  
  // UI helper methods
  addNewsItem(newsItem) {
    const newsContainer = document.getElementById('news-feed');
    if (!newsContainer) return;
    
    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.innerHTML = `
      <h4>${newsItem.title}</h4>
      <p>${newsItem.summary}</p>
      <small>${new Date(newsItem.timestamp).toLocaleString()}</small>
    `;
    
    newsContainer.insertBefore(newsElement, newsContainer.firstChild);
    
    // Limit to 10 items
    const items = newsContainer.querySelectorAll('.news-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }
  
  addAIInsight(insight) {
    const aiContainer = document.getElementById('ai-insights');
    if (!aiContainer) return;
    
    const insightElement = document.createElement('div');
    insightElement.className = 'ai-insight';
    insightElement.innerHTML = `
      <h4>${insight.title}</h4>
      <p>${insight.content}</p>
      <div class="confidence">Confidence: ${(insight.confidence * 100).toFixed(1)}%</div>
      <small>${new Date(insight.timestamp).toLocaleString()}</small>
    `;
    
    aiContainer.insertBefore(insightElement, aiContainer.firstChild);
    
    // Limit to 5 items
    const items = aiContainer.querySelectorAll('.ai-insight');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
  }
  
  // Utility methods
  pauseUpdates() {
    console.log('⏸️ Pausing real-time updates');
    this.socket.emit('pause-updates');
  }
  
  resumeUpdates() {
    console.log('▶️ Resuming real-time updates');
    this.socket.emit('resume-updates');
  }
  
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
  getStatus() {
    return {
      connected: this.isConnected,
      subscriptions: Array.from(this.subscriptions),
      reconnectAttempts: this.reconnectAttempts
    };
  }
  
  // Request methods
  requestMarketData(symbol, timeframe = '1m') {
    if (!this.isConnected) return;
    
    this.socket.emit('request-data', {
      type: 'market-data',
      symbol: symbol,
      timeframe: timeframe
    });
  }
  
  requestNews(symbol = null) {
    if (!this.isConnected) return;
    
    this.socket.emit('request-data', {
      type: 'news',
      symbol: symbol
    });
  }
  
  requestAIInsights(symbol = null) {
    if (!this.isConnected) return;
    
    this.socket.emit('request-data', {
      type: 'ai-insights',
      symbol: symbol
    });
  }
  
  requestPortfolio(userId) {
    if (!this.isConnected) return;
    
    this.socket.emit('request-data', {
      type: 'portfolio',
      userId: userId
    });
  }
}

// Initialize real-time client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.realtimeClient = new RealtimeClient();
  
  // Set up default subscriptions
  window.realtimeClient.subscribe('market-data');
  window.realtimeClient.subscribe('news');
  window.realtimeClient.subscribe('ai-insights');
  
  // Set up default event handlers
  window.realtimeClient.on('system:connected', () => {
    console.log('✅ Real-time service connected');
    document.body.classList.remove('offline');
  });
  
  window.realtimeClient.on('system:disconnected', () => {
    console.log('❌ Real-time service disconnected');
    document.body.classList.add('offline');
  });
  
  window.realtimeClient.on('market:update', (data) => {
    console.log('📊 Market update received:', data);
  });
  
  window.realtimeClient.on('news:update', (data) => {
    console.log('📰 News update received:', data);
  });
  
  window.realtimeClient.on('ai:update', (data) => {
    console.log('🤖 AI insights update received:', data);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeClient;
}
