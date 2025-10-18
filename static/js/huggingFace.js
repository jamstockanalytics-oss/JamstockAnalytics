// Hugging Face Client for JamStockAnalytics
class HuggingFaceClient {
  constructor() {
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    this.initialize();
  }
  
  initialize() {
    console.log('🤗 Initializing Hugging Face Client...');
    
    this.setupEventListeners();
    this.setupUI();
    this.checkServiceStatus();
  }
  
  setupEventListeners() {
    // Listen for real-time Hugging Face updates
    if (window.realtimeClient) {
      window.realtimeClient.on('huggingface:sentiment', (data) => {
        this.handleSentimentUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:emotion', (data) => {
        this.handleEmotionUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:financial', (data) => {
        this.handleFinancialSentimentUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:classify', (data) => {
        this.handleTextClassificationUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:summarize', (data) => {
        this.handleSummarizationUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:question', (data) => {
        this.handleQuestionAnsweringUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:generate', (data) => {
        this.handleTextGenerationUpdate(data);
      });
      
      window.realtimeClient.on('huggingface:embeddings', (data) => {
        this.handleEmbeddingsUpdate(data);
      });
    }
    
    // Listen for Socket.IO Hugging Face events
    if (window.io) {
      const socket = window.io();
      
      socket.on('huggingface-sentiment-analyzed', (data) => {
        this.handleSentimentUpdate(data);
      });
      
      socket.on('huggingface-emotion-analyzed', (data) => {
        this.handleEmotionUpdate(data);
      });
      
      socket.on('huggingface-financial-sentiment-analyzed', (data) => {
        this.handleFinancialSentimentUpdate(data);
      });
      
      socket.on('huggingface-text-classified', (data) => {
        this.handleTextClassificationUpdate(data);
      });
      
      socket.on('huggingface-text-summarized', (data) => {
        this.handleSummarizationUpdate(data);
      });
      
      socket.on('huggingface-question-answered', (data) => {
        this.handleQuestionAnsweringUpdate(data);
      });
      
      socket.on('huggingface-text-generated', (data) => {
        this.handleTextGenerationUpdate(data);
      });
      
      socket.on('huggingface-embeddings-generated', (data) => {
        this.handleEmbeddingsUpdate(data);
      });
    }
  }
  
  setupUI() {
    this.createHuggingFaceDashboard();
    this.createAnalysisInterface();
    this.createResultsDisplay();
  }
  
  async checkServiceStatus() {
    try {
      const response = await fetch('/api/huggingface/status');
      const data = await response.json();
      
      if (data.success) {
        this.isConnected = true;
        this.updateServiceStatus(true);
        this.emit('service-connected', data.data);
      } else {
        this.isConnected = false;
        this.updateServiceStatus(false);
        this.emit('service-disconnected', data.message);
      }
    } catch (error) {
      console.error('❌ Error checking Hugging Face service status:', error);
      this.isConnected = false;
      this.updateServiceStatus(false);
    }
  }
  
  // API Methods
  async analyzeSentiment(text, options = {}) {
    try {
      const cacheKey = `sentiment:${text}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('sentiment-analyzed', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      throw error;
    }
  }
  
  async analyzeEmotion(text, options = {}) {
    try {
      const cacheKey = `emotion:${text}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('emotion-analyzed', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error analyzing emotion:', error);
      throw error;
    }
  }
  
  async analyzeFinancialSentiment(text, options = {}) {
    try {
      const cacheKey = `financial:${text}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/financial-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('financial-sentiment-analyzed', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error analyzing financial sentiment:', error);
      throw error;
    }
  }
  
  async classifyText(text, labels, options = {}) {
    try {
      const cacheKey = `classify:${text}:${JSON.stringify(labels)}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, labels, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('text-classified', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error classifying text:', error);
      throw error;
    }
  }
  
  async summarizeText(text, options = {}) {
    try {
      const cacheKey = `summarize:${text}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('text-summarized', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error summarizing text:', error);
      throw error;
    }
  }
  
  async answerQuestion(question, context, options = {}) {
    try {
      const cacheKey = `question:${question}:${context}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/question-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, context, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('question-answered', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error answering question:', error);
      throw error;
    }
  }
  
  async generateText(prompt, options = {}) {
    try {
      const cacheKey = `generate:${prompt}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('text-generated', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error generating text:', error);
      throw error;
    }
  }
  
  async getEmbeddings(text, options = {}) {
    try {
      const cacheKey = `embeddings:${text}:${JSON.stringify(options)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        this.cache.delete(cacheKey);
      }
      
      const response = await fetch('/api/huggingface/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.cacheResponse(cacheKey, data.data);
        this.emit('embeddings-generated', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error generating embeddings:', error);
      throw error;
    }
  }
  
  async batchProcess(texts, model, options = {}) {
    try {
      const response = await fetch('/api/huggingface/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texts, model, options })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.emit('batch-processed', data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error processing batch:', error);
      throw error;
    }
  }
  
  // Event Handlers
  handleSentimentUpdate(data) {
    this.updateSentimentUI(data);
    this.emit('sentiment-updated', data);
  }
  
  handleEmotionUpdate(data) {
    this.updateEmotionUI(data);
    this.emit('emotion-updated', data);
  }
  
  handleFinancialSentimentUpdate(data) {
    this.updateFinancialSentimentUI(data);
    this.emit('financial-sentiment-updated', data);
  }
  
  handleTextClassificationUpdate(data) {
    this.updateTextClassificationUI(data);
    this.emit('text-classification-updated', data);
  }
  
  handleSummarizationUpdate(data) {
    this.updateSummarizationUI(data);
    this.emit('summarization-updated', data);
  }
  
  handleQuestionAnsweringUpdate(data) {
    this.updateQuestionAnsweringUI(data);
    this.emit('question-answering-updated', data);
  }
  
  handleTextGenerationUpdate(data) {
    this.updateTextGenerationUI(data);
    this.emit('text-generation-updated', data);
  }
  
  handleEmbeddingsUpdate(data) {
    this.updateEmbeddingsUI(data);
    this.emit('embeddings-updated', data);
  }
  
  // UI Update Methods
  updateServiceStatus(connected) {
    const statusElement = document.getElementById('huggingface-status');
    if (statusElement) {
      statusElement.textContent = connected ? 'Connected' : 'Disconnected';
      statusElement.className = connected ? 'status-connected' : 'status-disconnected';
    }
  }
  
  updateSentimentUI(data) {
    const sentimentElement = document.getElementById('huggingface-sentiment');
    if (sentimentElement) {
      sentimentElement.textContent = data.sentiment;
      sentimentElement.className = `sentiment-${data.sentiment}`;
    }
    
    const confidenceElement = document.getElementById('huggingface-sentiment-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateEmotionUI(data) {
    const emotionElement = document.getElementById('huggingface-emotion');
    if (emotionElement) {
      emotionElement.textContent = data.emotion;
      emotionElement.className = `emotion-${data.emotion}`;
    }
    
    const confidenceElement = document.getElementById('huggingface-emotion-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateFinancialSentimentUI(data) {
    const financialElement = document.getElementById('huggingface-financial-sentiment');
    if (financialElement) {
      financialElement.textContent = data.sentiment;
      financialElement.className = `sentiment-${data.sentiment}`;
    }
    
    const confidenceElement = document.getElementById('huggingface-financial-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateTextClassificationUI(data) {
    const classificationElement = document.getElementById('huggingface-classification');
    if (classificationElement) {
      classificationElement.textContent = data.classification;
      classificationElement.className = `classification-${data.classification}`;
    }
    
    const confidenceElement = document.getElementById('huggingface-classification-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateSummarizationUI(data) {
    const summaryElement = document.getElementById('huggingface-summary');
    if (summaryElement) {
      summaryElement.textContent = data.summary;
    }
    
    const confidenceElement = document.getElementById('huggingface-summary-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateQuestionAnsweringUI(data) {
    const answerElement = document.getElementById('huggingface-answer');
    if (answerElement) {
      answerElement.textContent = data.answer;
    }
    
    const confidenceElement = document.getElementById('huggingface-answer-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateTextGenerationUI(data) {
    const generatedElement = document.getElementById('huggingface-generated-text');
    if (generatedElement) {
      generatedElement.textContent = data.generatedText;
    }
    
    const confidenceElement = document.getElementById('huggingface-generated-confidence');
    if (confidenceElement) {
      confidenceElement.textContent = (data.confidence * 100).toFixed(1) + '%';
    }
  }
  
  updateEmbeddingsUI(data) {
    const embeddingsElement = document.getElementById('huggingface-embeddings');
    if (embeddingsElement) {
      embeddingsElement.textContent = `Dimension: ${data.dimension}`;
    }
  }
  
  // UI Creation Methods
  createHuggingFaceDashboard() {
    const dashboardHTML = `
      <div class="huggingface-dashboard">
        <h2>Hugging Face AI Analysis</h2>
        
        <div class="service-status">
          <h3>Service Status</h3>
          <div class="status-indicator">
            <span id="huggingface-status" class="status-disconnected">Checking...</span>
          </div>
        </div>
        
        <div class="analysis-tools">
          <div class="tool-card sentiment">
            <h3>Sentiment Analysis</h3>
            <div class="result" id="huggingface-sentiment">-</div>
            <div class="confidence">Confidence: <span id="huggingface-sentiment-confidence">-</span></div>
          </div>
          
          <div class="tool-card emotion">
            <h3>Emotion Analysis</h3>
            <div class="result" id="huggingface-emotion">-</div>
            <div class="confidence">Confidence: <span id="huggingface-emotion-confidence">-</span></div>
          </div>
          
          <div class="tool-card financial">
            <h3>Financial Sentiment</h3>
            <div class="result" id="huggingface-financial-sentiment">-</div>
            <div class="confidence">Confidence: <span id="huggingface-financial-confidence">-</span></div>
          </div>
          
          <div class="tool-card classification">
            <h3>Text Classification</h3>
            <div class="result" id="huggingface-classification">-</div>
            <div class="confidence">Confidence: <span id="huggingface-classification-confidence">-</span></div>
          </div>
        </div>
      </div>
    `;
    
    // Add to page if Hugging Face dashboard doesn't exist
    if (!document.getElementById('huggingface-dashboard')) {
      const container = document.createElement('div');
      container.id = 'huggingface-dashboard';
      container.innerHTML = dashboardHTML;
      document.body.appendChild(container);
    }
  }
  
  createAnalysisInterface() {
    const interfaceHTML = `
      <div class="huggingface-interface">
        <h3>AI Analysis Interface</h3>
        
        <div class="input-section">
          <textarea id="huggingface-text-input" placeholder="Enter text to analyze..."></textarea>
          <div class="button-group">
            <button id="analyze-sentiment-btn">Analyze Sentiment</button>
            <button id="analyze-emotion-btn">Analyze Emotion</button>
            <button id="analyze-financial-btn">Financial Sentiment</button>
            <button id="classify-text-btn">Classify Text</button>
            <button id="summarize-text-btn">Summarize</button>
            <button id="generate-text-btn">Generate Text</button>
          </div>
        </div>
        
        <div class="results-section">
          <div id="huggingface-results" class="results-container"></div>
        </div>
      </div>
    `;
    
    // Add to page if Hugging Face interface doesn't exist
    if (!document.getElementById('huggingface-interface')) {
      const container = document.createElement('div');
      container.id = 'huggingface-interface';
      container.innerHTML = interfaceHTML;
      document.body.appendChild(container);
    }
  }
  
  createResultsDisplay() {
    // Results display is created dynamically
  }
  
  // Utility Methods
  cacheResponse(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
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
          console.error(`❌ Error in Hugging Face event handler for ${event}:`, error);
        }
      });
    }
  }
  
  // Status Methods
  getStatus() {
    return {
      isConnected: this.isConnected,
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout
    };
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Initialize Hugging Face client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.huggingFaceClient = new HuggingFaceClient();
  
  // Set up analysis buttons
  const analyzeSentimentBtn = document.getElementById('analyze-sentiment-btn');
  const analyzeEmotionBtn = document.getElementById('analyze-emotion-btn');
  const analyzeFinancialBtn = document.getElementById('analyze-financial-btn');
  const classifyTextBtn = document.getElementById('classify-text-btn');
  const summarizeTextBtn = document.getElementById('summarize-text-btn');
  const generateTextBtn = document.getElementById('generate-text-btn');
  const textInput = document.getElementById('huggingface-text-input');
  const resultsContainer = document.getElementById('huggingface-results');
  
  if (analyzeSentimentBtn && textInput && resultsContainer) {
    analyzeSentimentBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const result = await window.huggingFaceClient.analyzeSentiment(text);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Sentiment:</strong> <span class="sentiment-${result.sentiment}">${result.sentiment}</span>
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
  
  if (analyzeEmotionBtn && textInput && resultsContainer) {
    analyzeEmotionBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const result = await window.huggingFaceClient.analyzeEmotion(text);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Emotion:</strong> <span class="emotion-${result.emotion}">${result.emotion}</span>
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
  
  if (analyzeFinancialBtn && textInput && resultsContainer) {
    analyzeFinancialBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const result = await window.huggingFaceClient.analyzeFinancialSentiment(text);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Financial Sentiment:</strong> <span class="sentiment-${result.sentiment}">${result.sentiment}</span>
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
  
  if (classifyTextBtn && textInput && resultsContainer) {
    classifyTextBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const labels = ['positive', 'negative', 'neutral', 'financial', 'news'];
          const result = await window.huggingFaceClient.classifyText(text, labels);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Classification:</strong> <span class="classification-${result.classification}">${result.classification}</span>
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
  
  if (summarizeTextBtn && textInput && resultsContainer) {
    summarizeTextBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const result = await window.huggingFaceClient.summarizeText(text);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Summary:</strong> ${result.summary}
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
  
  if (generateTextBtn && textInput && resultsContainer) {
    generateTextBtn.addEventListener('click', async () => {
      const text = textInput.value.trim();
      if (text) {
        try {
          const result = await window.huggingFaceClient.generateText(text);
          resultsContainer.innerHTML = `
            <div class="result-item">
              <strong>Generated Text:</strong> ${result.generatedText}
            </div>
            <div class="result-item">
              <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
        } catch (error) {
          resultsContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
      }
    });
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HuggingFaceClient;
}
