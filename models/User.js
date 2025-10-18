const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    avatar: String,
    bio: String,
    location: String,
    investmentExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  portfolio: {
    totalValue: { type: Number, default: 0 },
    totalGain: { type: Number, default: 0 },
    totalGainPercentage: { type: Number, default: 0 },
    holdings: [{
      symbol: String,
      name: String,
      shares: Number,
      averagePrice: Number,
      currentPrice: Number,
      value: Number,
      gain: Number,
      gainPercentage: Number
    }]
  },
  watchlist: [{
    symbol: String,
    name: String,
    addedAt: { type: Date, default: Date.now }
  }],
  aiInsights: {
    lastAnalysis: Date,
    preferences: {
      analysisDepth: {
        type: String,
        enum: ['basic', 'detailed', 'comprehensive'],
        default: 'detailed'
      },
      updateFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily'],
        default: 'hourly'
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    features: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'portfolio.holdings.symbol': 1 });
userSchema.index({ 'watchlist.symbol': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
