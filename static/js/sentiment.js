// Sentiment Analysis Client for JamStockAnalytics
class SentimentClient {
  constructor() {
    this.sentimentData = {
      overall: null,
      news: null,
      market: null,
      social: null
    };
    this.sentimentHistory = [];
    this.isConnected = false;
    this.eventHandlers = new Map();
    
    this.initialize();
  }
  
  initialize() {
    console.log('🧠 Initializing Sentiment Analysis Client...');
    
    this.setupEventListeners();
    this.startDataFetching();
    this.setupUI();
  }
  
  setupEventListeners() {
    // Listen for real-time sentiment updates
    if (window.realtimeClient) {
      window.realtimeClient.on('sentiment:overall', (data) => {
        this.handleOverallSentimentUpdate(data);
      });
      
      window.realtimeClient.on('sentiment:news', (data) => {
        this.handleNewsSentimentUpdate(data);
      });
      
      window.realtimeClient.on('sentiment:market', (data) => {
        this.handleMarketSentimentUpdate(data);
      });
      
      window.realtimeClient.on('sentiment:social', (data) => {
        this.handleSocialSentimentUpdate(data);
      });
    }
    
    // Listen for Socket.IO sentiment events
    if (window.io) {
      const socket = window.io();
      
      socket.on('overall-sentiment-update', (data) => {
        this.handleOverallSentimentUpdate(data);
      });
      
      socket.on('news-sentiment-update', (data) => {
        this.handleNewsSentimentUpdate(data);
      });
      
      socket.on('market-sentiment-update', (data) => {
        this.handleMarketSentimentUpdate(data);
      });
      
      socket.on('social-sentiment-update', (data) => {
        this.handleSocialSentimentUpdate(data);
      });
    }
  }
  
  startDataFetching() {
    // Fetch initial sentiment data
    this.fetchOverallSentiment();
    this.fetchNewsSentiment();
    this.fetchMarketSentiment();
    this.fetchSocialSentiment();
    
    // Set up periodic data fetching
    setInterval(() => {
      this.fetchOverallSentiment();
    }, 60000); // Every minute
    
    setInterval(() => {
      this.fetchNewsSentiment();
    }, 300000); // Every 5 minutes
    
    setInterval(() => {
      this.fetchMarketSentiment();
    }, 120000); // Every 2 minutes
    
    setInterval(() => {
      this.fetchSocialSentiment();
    }, 600000); // Every 10 minutes
  }
  
  setupUI() {
    this.createSentimentDashboard();
    this.createSentimentIndicators();
    this.createSentimentCharts();
  }
  
  // API Methods
  async fetchOverallSentiment() {
    try {
      const response = await fetch('/api/sentiment/overall');
      const data = await response.json();
      
      if (data.success) {
        this.sentimentData.overall = data.data;
        this.updateOverallSentimentUI(data.data);
        this.emit('overall-sentiment-updated', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching overall sentiment:', error);
    }
  }
  
  async fetchNewsSentiment() {
    try {
      const response = await fetch('/api/sentiment/news');
      const data = await response.json();
      
      if (data.success) {
        this.sentimentData.news = data.data;
        this.updateNewsSentimentUI(data.data);
        this.emit('news-sentiment-updated', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching news sentiment:', error);
    }
  }
  
  async fetchMarketSentiment() {
    try {
      const response = await fetch('/api/sentiment/market');
      const data = await response.json();
      
      if (data.success) {
        this.sentimentData.market = data.data;
        this.updateMarketSentimentUI(data.data);
        this.emit('market-sentiment-updated', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching market sentiment:', error);
    }
  }
  
  async fetchSocialSentiment() {
    try {
      const response = await fetch('/api/sentiment/social');
      const data = await response.json();
      
      if (data.success) {
        this.sentimentData.social = data.data;
        this.updateSocialSentimentUI(data.data);
        this.emit('social-sentiment-updated', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching social sentiment:', error);
    }
  }
  
  async fetchSentimentHistory(timeframe = '24h', limit = 50) {
    try {
      const response = await fetch(`/api/sentiment/history?timeframe=${timeframe}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        this.sentimentHistory = data.data;
        this.updateSentimentHistoryChart(data.data);
        this.emit('sentiment-history-updated', data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching sentiment history:', error);
    }
  }
  
  async analyzeCustomText(text) {
    try {
      const response = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.emit('custom-sentiment-analyzed', data.data);
        return data.data;
      }
    } catch (error) {
      console.error('❌ Error analyzing custom text:', error);
    }
  }
  
  // Event Handlers
  handleOverallSentimentUpdate(data) {
    this.sentimentData.overall = data;
    this.updateOverallSentimentUI(data);
    this.emit('overall-sentiment-updated', data);
  }
  
  handleNewsSentimentUpdate(data) {
    this.sentimentData.news = data;
    this.updateNewsSentimentUI(data);
    this.emit('news-sentiment-updated', data);
  }
  
  handleMarketSentimentUpdate(data) {
    this.sentimentData.market = data;
    this.updateMarketSentimentUI(data);
    this.emit('market-sentiment-updated', data);
  }
  
  handleSocialSentimentUpdate(data) {
    this.sentimentData.social = data;
    this.updateSocialSentimentUI(data);
    this.emit('social-sentiment-updated', data);
  }
  
  // UI Update Methods
  updateOverallSentimentUI(data) {
    const sentimentElement = document.getElementById('overall-sentiment');
    if (sentimentElement) {
      sentimentElement.textContent = data.sentiment;
      sentimentElement.className = `sentiment-${data.sentiment}`;
    }
    
    const scoreElement = document.getElementById('overall-sentiment-score');
    if (scoreElement) {
      scoreElement.textContent = (data.score * 100).toFixed(1) + '%';
    }
    
    const confidenceElement = document.getElementById('overall-sentiment-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
    
    const recommendationElement = document.getElementById('overall-sentiment-recommendation');
    if (recommendationElement && data.recommendation) {
      recommendationElement.textContent = data.recommendation.action.toUpperCase();
      recommendationElement.className = `recommendation-${data.recommendation.action}`;
    }
  }
  
  updateNewsSentimentUI(data) {
    const newsSentimentElement = document.getElementById('news-sentiment');
    if (newsSentimentElement) {
      newsSentimentElement.textContent = data.sentiment;
      newsSentimentElement.className = `sentiment-${data.sentiment}`;
    }
    
    const newsScoreElement = document.getElementById('news-sentiment-score');
    if (newsScoreElement) {
      newsScoreElement.textContent = (data.score * 100).toFixed(1) + '%';
    }
  }
  
  updateMarketSentimentUI(data) {
    const marketSentimentElement = document.getElementById('market-sentiment');
    if (marketSentimentElement) {
      marketSentimentElement.textContent = data.sentiment;
      marketSentimentElement.className = `sentiment-${data.sentiment}`;
    }
    
    const marketScoreElement = document.getElementById('market-sentiment-score');
    if (marketScoreElement) {
      marketScoreElement.textContent = (data.score * 100).toFixed(1) + '%';
    }
  }
  
  updateSocialSentimentUI(data) {
    const socialSentimentElement = document.getElementById('social-sentiment');
    if (socialSentimentElement) {
      socialSentimentElement.textContent = data.sentiment;
      socialSentimentElement.className = `sentiment-${data.sentiment}`;
    }
    
    const socialScoreElement = document.getElementById('social-sentiment-score');
    if (socialScoreElement) {
      socialScoreElement.textContent = (data.score * 100).toFixed(1) + '%';
    }
  }
  
  updateSentimentHistoryChart(history) {
    // Update sentiment history chart
    const chartElement = document.getElementById('sentiment-history-chart');
    if (chartElement && history.length > 0) {
      this.renderSentimentChart(history);
    }
  }
  
  // UI Creation Methods
  createSentimentDashboard() {
    const dashboardHTML = `
      <div class="sentiment-dashboard">
        <h2>Market Sentiment Analysis</h2>
        
        <div class="sentiment-overview">
          <div class="sentiment-card overall">
            <h3>Overall Sentiment</h3>
            <div class="sentiment-value" id="overall-sentiment">Loading...</div>
            <div class="sentiment-score" id="overall-sentiment-score">-</div>
            <div class="sentiment-confidence">Confidence: <span id="overall-sentiment-confidence">-</span></div>
            <div class="sentiment-recommendation">Recommendation: <span id="overall-sentiment-recommendation">-</span></div>
          </div>
          
          <div class="sentiment-card news">
            <h3>News Sentiment</h3>
            <div class="sentiment-value" id="news-sentiment">Loading...</div>
            <div class="sentiment-score" id="news-sentiment-score">-</div>
          </div>
          
          <div class="sentiment-card market">
            <h3>Market Sentiment</h3>
            <div class="sentiment-value" id="market-sentiment">Loading...</div>
            <div class="sentiment-score" id="market-sentiment-score">-</div>
          </div>
          
          <div class="sentiment-card social">
            <h3>Social Sentiment</h3>
            <div class="sentiment-value" id="social-sentiment">Loading...</div>
            <div class="sentiment-score" id="social-sentiment-score">-</div>
          </div>
        </div>
        
        <div class="sentiment-history">
          <h3>Sentiment History</h3>
          <div id="sentiment-history-chart" class="sentiment-chart"></div>
        </div>
        
        <div class="sentiment-analysis">
          <h3>Custom Text Analysis</h3>
          <textarea id="custom-text-input" placeholder="Enter text to analyze sentiment..."></textarea>
          <button id="analyze-text-btn">Analyze Sentiment</button>
          <div id="custom-sentiment-result" class="sentiment-result"></div>
        </div>
      </div>
    `;
    
    // Add to page if sentiment dashboard doesn't exist
    if (!document.getElementById('sentiment-dashboard')) {
      const container = document.createElement('div');
      container.id = 'sentiment-dashboard';
      container.innerHTML = dashboardHTML;
      document.body.appendChild(container);
    }
  }
  
  createSentimentIndicators() {
    // Create sentiment indicators for existing elements
    const indicators = document.querySelectorAll('[data-sentiment]');
    indicators.forEach(indicator => {
      const sentiment = indicator.dataset.sentiment;
      indicator.className = `sentiment-indicator sentiment-${sentiment}`;
    });
  }
  
  createSentimentCharts() {
    // Create sentiment charts
    this.fetchSentimentHistory('24h', 100);
  }
  
  renderSentimentChart(history) {
    // Simple sentiment chart rendering
    const chartElement = document.getElementById('sentiment-history-chart');
    if (!chartElement) return;
    
    const chartHTML = history.map((item, index) => {
      const height = item.score * 100;
      const color = this.getSentimentColor(item.sentiment);
      return `
        <div class="chart-bar" style="height: ${height}%; background-color: ${color};" 
             title="${item.sentiment} (${(item.score * 100).toFixed(1)}%)">
        </div>
      `;
    }).join('');
    
    chartElement.innerHTML = `
      <div class="chart-container">
        ${chartHTML}
      </div>
    `;
  }
  
  getSentimentColor(sentiment) {
    switch (sentiment) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#f44336';
      case 'neutral':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  }
  
  // Event System
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }
  
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in sentiment event handler for ${event}:`, error);
        }
      });
    }
  }
  
  // Utility Methods
  getSentimentData() {
    return this.sentimentData;
  }
  
  getSentimentHistory() {
    return this.sentimentHistory;
  }
  
  getStatus() {
    return {
      isConnected: this.isConnected,
      hasOverallSentiment: !!this.sentimentData.overall,
      hasNewsSentiment: !!this.sentimentData.news,
      hasMarketSentiment: !!this.sentimentData.market,
      hasSocialSentiment: !!this.sentimentData.social,
      historyCount: this.sentimentHistory.length
    };
  }
}

// Initialize sentiment client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sentimentClient = new SentimentClient();
  
  // Set up custom text analysis
  const analyzeBtn = document.getElementById('analyze-text-btn');
  const customInput = document.getElementById('custom-text-input');
  const resultDiv = document.getElementById('custom-sentiment-result');
  
  if (analyzeBtn && customInput && resultDiv) {
    analyzeBtn.addEventListener('click', async () => {
      const text = customInput.value.trim();
      if (text) {
        const result = await window.sentimentClient.analyzeCustomText(text);
        if (result) {
          resultDiv.innerHTML = `
            <div class="sentiment-result-item">
              <strong>Sentiment:</strong> <span class="sentiment-${result.sentiment}">${result.sentiment}</span>
            </div>
            <div class="sentiment-result-item">
              <strong>Score:</strong> ${(result.score * 100).toFixed(1)}%
            </div>
            <div class="sentiment-result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        }
      }
    });
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SentimentClient;
}
