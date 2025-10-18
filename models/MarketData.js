const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  previousClose: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  changePercentage: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  high52Week: {
    type: Number,
    default: 0
  },
  low52Week: {
    type: Number,
    default: 0
  },
  peRatio: {
    type: Number,
    default: 0
  },
  dividendYield: {
    type: Number,
    default: 0
  },
  technicalIndicators: {
    rsi: Number,
    macd: Number,
    movingAverage20: Number,
    movingAverage50: Number,
    movingAverage200: Number,
    support: Number,
    resistance: Number
  },
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
      default: 'neutral'
    },
    recommendation: {
      type: String,
      enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'],
      default: 'hold'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    priceTarget: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    keyFactors: [String],
    summary: String
  },
  news: [{
    title: String,
    summary: String,
    source: String,
    publishedAt: Date,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    impact: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
marketDataSchema.index({ symbol: 1, lastUpdated: -1 });
marketDataSchema.index({ sector: 1, changePercentage: -1 });
marketDataSchema.index({ 'aiAnalysis.recommendation': 1, 'aiAnalysis.confidence': -1 });
marketDataSchema.index({ lastUpdated: -1 });

// Virtual for price change direction
marketDataSchema.virtual('isGaining').get(function() {
  return this.change > 0;
});

// Virtual for market cap category
marketDataSchema.virtual('marketCapCategory').get(function() {
  if (this.marketCap > 1000000000) return 'large';
  if (this.marketCap > 100000000) return 'mid';
  return 'small';
});

// Static method to get top performers
marketDataSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ changePercentage: -1 })
    .limit(limit)
    .select('symbol name currentPrice change changePercentage sector aiAnalysis');
};

// Static method to get AI recommendations
marketDataSchema.statics.getAIRecommendations = function() {
  return this.find({ 
    isActive: true,
    'aiAnalysis.recommendation': { $in: ['strong_buy', 'buy'] },
    'aiAnalysis.confidence': { $gte: 70 }
  })
  .sort({ 'aiAnalysis.confidence': -1 })
  .select('symbol name currentPrice aiAnalysis sector');
};

// Method to update AI analysis
marketDataSchema.methods.updateAIAnalysis = function(analysis) {
  this.aiAnalysis = {
    ...this.aiAnalysis,
    ...analysis,
    lastUpdated: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('MarketData', marketDataSchema);
