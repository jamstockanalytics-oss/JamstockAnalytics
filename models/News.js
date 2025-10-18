const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  symbols: [{
    type: String,
    uppercase: true,
    trim: true
  }],
  sentiment: {
    type: String,
    enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
    default: 'neutral'
  },
  impact: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['market', 'company', 'economic', 'regulatory', 'technology', 'other'],
    default: 'market'
  },
  aiAnalysis: {
    keyPoints: [String],
    summary: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
newsSchema.index({ publishedAt: -1, isActive: 1 });
newsSchema.index({ symbols: 1, publishedAt: -1 });
newsSchema.index({ sentiment: 1, publishedAt: -1 });
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ 'aiAnalysis.relevanceScore': -1, publishedAt: -1 });

// Virtual for time since publication
newsSchema.virtual('timeSincePublication').get(function() {
  const now = new Date();
  const diff = now - this.publishedAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Static method to get latest news
newsSchema.statics.getLatestNews = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title summary source publishedAt sentiment symbols category aiAnalysis');
};

// Static method to get news by symbol
newsSchema.statics.getNewsBySymbol = function(symbol, limit = 10) {
  return this.find({ 
    isActive: true,
    symbols: symbol.toUpperCase()
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title summary source publishedAt sentiment category aiAnalysis');
};

// Static method to get news by sentiment
newsSchema.statics.getNewsBySentiment = function(sentiment, limit = 10) {
  return this.find({ 
    isActive: true,
    sentiment: sentiment
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title summary source publishedAt sentiment symbols category');
};

// Static method to get high impact news
newsSchema.statics.getHighImpactNews = function(limit = 10) {
  return this.find({ 
    isActive: true,
    impact: 'high'
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title summary source publishedAt sentiment symbols category aiAnalysis');
};

// Method to update AI analysis
newsSchema.methods.updateAIAnalysis = function(analysis) {
  this.aiAnalysis = {
    ...this.aiAnalysis,
    ...analysis,
    lastUpdated: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('News', newsSchema);
