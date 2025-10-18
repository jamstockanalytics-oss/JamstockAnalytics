// Hugging Face API Service for JamStockAnalytics
const axios = require('axios');
const EventEmitter = require('events');

class HuggingFaceService extends EventEmitter {
  constructor() {
    super();
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.isInitialized = false;
    this.models = {
      sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      emotion: 'j-hartmann/emotion-english-distilroberta-base',
      financial: 'ProsusAI/finbert',
      textClassification: 'facebook/bart-large-mnli',
      summarization: 'facebook/bart-large-cnn',
      questionAnswering: 'deepset/roberta-base-squad2',
      textGeneration: 'gpt2',
      embeddings: 'sentence-transformers/all-MiniLM-L6-v2'
    };
    this.cache = new Map();
    this.rateLimits = new Map();
    this.isRunning = false;
    
    this.initialize();
  }
  
  initialize() {
    if (!this.apiKey) {
      console.warn('⚠️ HUGGINGFACE_API_KEY not found. Hugging Face features will be limited.');
      return;
    }
    
    console.log('🤗 Initializing Hugging Face Service...');
    
    this.setupRateLimiting();
    this.setupCaching();
    this.setupModels();
    
    this.isInitialized = true;
    this.isRunning = true;
    
    console.log('✅ Hugging Face Service initialized');
  }
  
  setupRateLimiting() {
    // Rate limiting for different models
    this.rateLimits.set('sentiment', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('emotion', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('financial', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('textClassification', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('summarization', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('questionAnswering', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('textGeneration', { requests: 0, resetTime: Date.now() + 60000 });
    this.rateLimits.set('embeddings', { requests: 0, resetTime: Date.now() + 60000 });
  }
  
  setupCaching() {
    // Cache setup for API responses
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 1000;
  }
  
  setupModels() {
    // Model configuration
    this.modelConfigs = {
      sentiment: {
        maxLength: 512,
        temperature: 0.7,
        topP: 0.9
      },
      emotion: {
        maxLength: 512,
        temperature: 0.7,
        topP: 0.9
      },
      financial: {
        maxLength: 512,
        temperature: 0.7,
        topP: 0.9
      },
      textClassification: {
        maxLength: 512,
        temperature: 0.7,
        topP: 0.9
      },
      summarization: {
        maxLength: 1024,
        minLength: 50,
        temperature: 0.7
      },
      questionAnswering: {
        maxLength: 512,
        temperature: 0.7
      },
      textGeneration: {
        maxLength: 100,
        temperature: 0.8,
        topP: 0.9
      },
      embeddings: {
        maxLength: 512
      }
    };
  }
  
  // Core API Methods
  async makeRequest(model, inputs, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Hugging Face service not initialized');
    }
    
    const cacheKey = this.getCacheKey(model, inputs, options);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }
    
    // Check rate limits
    if (!this.checkRateLimit(model)) {
      throw new Error(`Rate limit exceeded for model: ${model}`);
    }
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.models[model]}`,
        {
          inputs: inputs,
          parameters: {
            ...this.modelConfigs[model],
            ...options
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      // Update rate limit
      this.updateRateLimit(model);
      
      // Cache response
      this.cacheResponse(cacheKey, response.data);
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Hugging Face API error for ${model}:`, error.message);
      throw error;
    }
  }
  
  // Sentiment Analysis
  async analyzeSentiment(text, options = {}) {
    try {
      const result = await this.makeRequest('sentiment', text, options);
      
      // Process sentiment result
      const processedResult = this.processSentimentResult(result);
      
      this.emit('sentiment-analyzed', {
        text: text,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      throw error;
    }
  }
  
  processSentimentResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { sentiment: 'neutral', confidence: 0.5, scores: {} };
    }
    
    const scores = {};
    let maxScore = 0;
    let predictedSentiment = 'neutral';
    
    for (const item of result) {
      if (item.label && item.score) {
        scores[item.label] = item.score;
        if (item.score > maxScore) {
          maxScore = item.score;
          predictedSentiment = item.label;
        }
      }
    }
    
    return {
      sentiment: predictedSentiment,
      confidence: maxScore,
      scores: scores
    };
  }
  
  // Emotion Analysis
  async analyzeEmotion(text, options = {}) {
    try {
      const result = await this.makeRequest('emotion', text, options);
      
      const processedResult = this.processEmotionResult(result);
      
      this.emit('emotion-analyzed', {
        text: text,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Emotion analysis error:', error);
      throw error;
    }
  }
  
  processEmotionResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { emotion: 'neutral', confidence: 0.5, scores: {} };
    }
    
    const scores = {};
    let maxScore = 0;
    let predictedEmotion = 'neutral';
    
    for (const item of result) {
      if (item.label && item.score) {
        scores[item.label] = item.score;
        if (item.score > maxScore) {
          maxScore = item.score;
          predictedEmotion = item.label;
        }
      }
    }
    
    return {
      emotion: predictedEmotion,
      confidence: maxScore,
      scores: scores
    };
  }
  
  // Financial Sentiment Analysis
  async analyzeFinancialSentiment(text, options = {}) {
    try {
      const result = await this.makeRequest('financial', text, options);
      
      const processedResult = this.processFinancialSentimentResult(result);
      
      this.emit('financial-sentiment-analyzed', {
        text: text,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Financial sentiment analysis error:', error);
      throw error;
    }
  }
  
  processFinancialSentimentResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { sentiment: 'neutral', confidence: 0.5, scores: {} };
    }
    
    const scores = {};
    let maxScore = 0;
    let predictedSentiment = 'neutral';
    
    for (const item of result) {
      if (item.label && item.score) {
        scores[item.label] = item.score;
        if (item.score > maxScore) {
          maxScore = item.score;
          predictedSentiment = item.label;
        }
      }
    }
    
    return {
      sentiment: predictedSentiment,
      confidence: maxScore,
      scores: scores
    };
  }
  
  // Text Classification
  async classifyText(text, labels, options = {}) {
    try {
      const inputs = {
        text: text,
        labels: labels
      };
      
      const result = await this.makeRequest('textClassification', inputs, options);
      
      const processedResult = this.processTextClassificationResult(result);
      
      this.emit('text-classified', {
        text: text,
        labels: labels,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Text classification error:', error);
      throw error;
    }
  }
  
  processTextClassificationResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { classification: 'unknown', confidence: 0.5, scores: {} };
    }
    
    const scores = {};
    let maxScore = 0;
    let predictedClassification = 'unknown';
    
    for (const item of result) {
      if (item.label && item.score) {
        scores[item.label] = item.score;
        if (item.score > maxScore) {
          maxScore = item.score;
          predictedClassification = item.label;
        }
      }
    }
    
    return {
      classification: predictedClassification,
      confidence: maxScore,
      scores: scores
    };
  }
  
  // Text Summarization
  async summarizeText(text, options = {}) {
    try {
      const result = await this.makeRequest('summarization', text, options);
      
      const processedResult = this.processSummarizationResult(result);
      
      this.emit('text-summarized', {
        text: text,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Text summarization error:', error);
      throw error;
    }
  }
  
  processSummarizationResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { summary: '', confidence: 0.5 };
    }
    
    const summary = result[0].summary_text || '';
    const confidence = result[0].score || 0.5;
    
    return {
      summary: summary,
      confidence: confidence
    };
  }
  
  // Question Answering
  async answerQuestion(question, context, options = {}) {
    try {
      const inputs = {
        question: question,
        context: context
      };
      
      const result = await this.makeRequest('questionAnswering', inputs, options);
      
      const processedResult = this.processQuestionAnsweringResult(result);
      
      this.emit('question-answered', {
        question: question,
        context: context,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Question answering error:', error);
      throw error;
    }
  }
  
  processQuestionAnsweringResult(result) {
    if (!result || !result.answer) {
      return { answer: '', confidence: 0.5, start: 0, end: 0 };
    }
    
    return {
      answer: result.answer,
      confidence: result.score || 0.5,
      start: result.start || 0,
      end: result.end || 0
    };
  }
  
  // Text Generation
  async generateText(prompt, options = {}) {
    try {
      const result = await this.makeRequest('textGeneration', prompt, options);
      
      const processedResult = this.processTextGenerationResult(result);
      
      this.emit('text-generated', {
        prompt: prompt,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Text generation error:', error);
      throw error;
    }
  }
  
  processTextGenerationResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { generatedText: '', confidence: 0.5 };
    }
    
    const generatedText = result[0].generated_text || '';
    const confidence = result[0].score || 0.5;
    
    return {
      generatedText: generatedText,
      confidence: confidence
    };
  }
  
  // Text Embeddings
  async getEmbeddings(text, options = {}) {
    try {
      const result = await this.makeRequest('embeddings', text, options);
      
      const processedResult = this.processEmbeddingsResult(result);
      
      this.emit('embeddings-generated', {
        text: text,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      
      return processedResult;
      
    } catch (error) {
      console.error('❌ Embeddings generation error:', error);
      throw error;
    }
  }
  
  processEmbeddingsResult(result) {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return { embeddings: [], dimension: 0 };
    }
    
    const embeddings = result[0] || [];
    const dimension = embeddings.length;
    
    return {
      embeddings: embeddings,
      dimension: dimension
    };
  }
  
  // Batch Processing
  async batchProcess(texts, model, options = {}) {
    try {
      const results = [];
      
      for (const text of texts) {
        const result = await this.makeRequest(model, text, options);
        results.push({
          text: text,
          result: result
        });
      }
      
      this.emit('batch-processed', {
        model: model,
        count: texts.length,
        results: results,
        timestamp: new Date().toISOString()
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Batch processing error:', error);
      throw error;
    }
  }
  
  // Utility Methods
  getCacheKey(model, inputs, options) {
    return `${model}:${JSON.stringify(inputs)}:${JSON.stringify(options)}`;
  }
  
  cacheResponse(key, data) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }
  
  checkRateLimit(model) {
    const limit = this.rateLimits.get(model);
    if (!limit) return true;
    
    if (Date.now() > limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = Date.now() + 60000;
    }
    
    return limit.requests < 100; // 100 requests per minute
  }
  
  updateRateLimit(model) {
    const limit = this.rateLimits.get(model);
    if (limit) {
      limit.requests++;
    }
  }
  
  // Status and Monitoring
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      hasApiKey: !!this.apiKey,
      cacheSize: this.cache.size,
      rateLimits: Object.fromEntries(this.rateLimits),
      models: this.models
    };
  }
  
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      timeout: this.cacheTimeout
    };
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  // Cleanup
  shutdown() {
    console.log('🛑 Shutting down Hugging Face service...');
    this.isRunning = false;
    this.cache.clear();
    this.rateLimits.clear();
  }
}

module.exports = HuggingFaceService;
