// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
require("./instrument.js");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import Sentry after instrument.js
const Sentry = require('@sentry/node');

// Import routes
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const newsRoutes = require('./routes/news');
const portfolioRoutes = require('./routes/portfolio');
const aiRoutes = require('./routes/ai');
const sentimentRoutes = require('./routes/sentiment');
const huggingFaceRoutes = require('./routes/huggingFace');

// Import middleware
const authMiddleware = require('./middleware/auth');
const rateLimitMiddleware = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const { 
  performanceMiddleware, 
  cacheControl, 
  etagMiddleware, 
  requestSizeLimit, 
  memoryMonitor,
  queryOptimizer 
} = require('./middleware/performance');

// Import services
const DatabaseService = require('./services/database');
const MarketDataService = require('./services/marketData');
const AIService = require('./services/ai');
const NewsService = require('./services/news');
const PortfolioService = require('./services/portfolio');
const cacheService = require('./services/cache');
const RealtimeService = require('./services/realtime');
const SentimentAnalysisService = require('./services/sentimentAnalysis');
const HuggingFaceService = require('./services/huggingFace');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware with enhanced headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers for API routes
app.use((req, res, next) => {
  // Add security headers for all routes
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// Sentry is automatically instrumented in v7+ - no manual middleware needed

// Advanced compression middleware for performance
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress files larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  },
  // Performance optimizations
  memLevel: 8,
  strategy: 1, // Z_DEFAULT_STRATEGY
  windowBits: 15
}));
// Performance monitoring middleware
app.use(performanceMiddleware);
app.use(memoryMonitor);
app.use(queryOptimizer);

// Request size limiting
app.use(requestSizeLimit('10mb'));

// ETag middleware for better caching
app.use(etagMiddleware);

// Cache control middleware
app.use(cacheControl(3600)); // 1 hour default cache

app.use(morgan('combined'));

// Body parsing with performance optimizations
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Limit number of parameters
}));

// Performance optimization middleware
app.use((req, res, next) => {
  // Track request start time
  req.startTime = Date.now();
  
  // Enable keep-alive for better performance
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  
  // Add performance timing headers
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
});

// Rate limiting
app.use(rateLimitMiddleware);

// Static files with caching optimization
app.use(express.static(path.join(__dirname, 'public'), { 
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Cache static assets for 1 day
    if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.ico')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/huggingface', huggingFaceRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await DatabaseService.healthCheck();
    
    res.json({
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealth.status,
        state: dbHealth.state,
        database: dbHealth.database
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Webhook integration endpoints
app.post('/api/webhook/market-update', async (req, res) => {
  try {
    const { symbol, price, change, timestamp } = req.body;
    
    // Emit real-time market update
    io.emit('market-update', {
      symbol,
      price,
      change,
      timestamp: timestamp || new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Market update broadcasted' });
  } catch (error) {
    console.error('Market update webhook error:', error);
    res.status(500).json({ success: false, error: 'Market update failed' });
  }
});

app.post('/api/webhook/news-update', async (req, res) => {
  try {
    const { title, summary, sentiment, symbols, timestamp } = req.body;
    
    // Emit real-time news update
    io.emit('news-update', {
      title,
      summary,
      sentiment,
      symbols,
      timestamp: timestamp || new Date().toISOString()
    });
    
    res.json({ success: true, message: 'News update broadcasted' });
  } catch (error) {
    console.error('News update webhook error:', error);
    res.status(500).json({ success: false, error: 'News update failed' });
  }
});

app.post('/api/webhook/ai-analysis', async (req, res) => {
  try {
    const { symbol, recommendation, confidence, timestamp } = req.body;
    
    // Emit real-time AI analysis
    io.emit('ai-analysis', {
      symbol,
      recommendation,
      confidence,
      timestamp: timestamp || new Date().toISOString()
    });
    
    res.json({ success: true, message: 'AI analysis broadcasted' });
  } catch (error) {
    console.error('AI analysis webhook error:', error);
    res.status(500).json({ success: false, error: 'AI analysis failed' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  // User connected

  // Join user to market updates room
  socket.on('join-market-updates', (userId) => {
    socket.join(`market-${userId}`);
    // User joined market updates
  });

  // Handle portfolio updates
  socket.on('update-portfolio', async (data) => {
    try {
      const { userId, portfolio } = data;
      // Process portfolio update
      const updatedPortfolio = await PortfolioService.updatePortfolio(userId, portfolio);
      socket.emit('portfolio-updated', updatedPortfolio);
    } catch (error) {
      socket.emit('error', { message: 'Failed to update portfolio' });
    }
  });

  // Handle AI chat
  socket.on('ai-chat', async (data) => {
    try {
      const { message, userId } = data;
      const response = await AIService.processChatMessage(message, userId);
      socket.emit('ai-response', response);
    } catch (error) {
      socket.emit('error', { message: 'AI service temporarily unavailable' });
    }
  });

  socket.on('disconnect', () => {
    // User disconnected
  });
});

// Error handling middleware
app.use(errorHandler);

// Sentry error handler removed - using instrument.js approach

// Initialize services
async function initializeServices() {
  try {
    console.log('🔄 Initializing services...');
    
    // Connect to database first - this is required for all services
    console.log('📊 Connecting to MongoDB database...');
    await DatabaseService.connect();
    console.log('✅ Database connected successfully');
    console.log(`🗄️ Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    
    // Initialize all services with database connection
    console.log('🚀 Initializing all services...');
    
    await MarketDataService.initialize();
    console.log('✅ Market Data Service initialized with database');
    
    await AIService.initialize();
    console.log('✅ AI Service initialized with database');
    
    await NewsService.initialize();
    console.log('✅ News Service initialized with database');
    
    // Initialize real-time service
    const realtimeService = new RealtimeService(io);
    app.locals.realtimeService = realtimeService;
    console.log('✅ Real-time Service initialized');
    
    // Initialize sentiment analysis service
    const sentimentService = new SentimentAnalysisService();
    app.locals.sentimentService = sentimentService;
    setupSentimentEventHandlers(sentimentService, io);
    console.log('✅ Sentiment Analysis Service initialized');
    
    // Initialize Hugging Face service
    const huggingFaceService = new HuggingFaceService();
    app.locals.huggingFaceService = huggingFaceService;
    setupHuggingFaceEventHandlers(huggingFaceService, io);
    console.log('✅ Hugging Face Service initialized');
    
    // Start background jobs
    startBackgroundJobs();
    console.log('✅ Background jobs started');
    
    console.log('🎉 All services initialized successfully with database!');
    console.log('💾 Full database connectivity enabled for all features');
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    console.error('💡 Database connection is required for full functionality');
    console.error('🔧 Check your MONGODB_URI environment variable');
    process.exit(1);
  }
}

// Set up sentiment analysis event handlers
function setupSentimentEventHandlers(sentimentService, io) {
  // News sentiment updates
  sentimentService.on('news-sentiment-update', (data) => {
    io.emit('news-sentiment-update', data);
  });
  
  // Market sentiment updates
  sentimentService.on('market-sentiment-update', (data) => {
    io.emit('market-sentiment-update', data);
  });
  
  // Social sentiment updates
  sentimentService.on('social-sentiment-update', (data) => {
    io.emit('social-sentiment-update', data);
  });
  
  // Overall sentiment updates
  sentimentService.on('overall-sentiment-update', (data) => {
    io.emit('overall-sentiment-update', data);
  });
  
  // Overall news sentiment updates
  sentimentService.on('overall-news-sentiment', (data) => {
    io.emit('overall-news-sentiment', data);
  });
}

// Set up Hugging Face event handlers
function setupHuggingFaceEventHandlers(huggingFaceService, io) {
  // Sentiment analysis updates
  huggingFaceService.on('sentiment-analyzed', (data) => {
    io.emit('huggingface-sentiment-analyzed', data);
  });
  
  // Emotion analysis updates
  huggingFaceService.on('emotion-analyzed', (data) => {
    io.emit('huggingface-emotion-analyzed', data);
  });
  
  // Financial sentiment updates
  huggingFaceService.on('financial-sentiment-analyzed', (data) => {
    io.emit('huggingface-financial-sentiment-analyzed', data);
  });
  
  // Text classification updates
  huggingFaceService.on('text-classified', (data) => {
    io.emit('huggingface-text-classified', data);
  });
  
  // Text summarization updates
  huggingFaceService.on('text-summarized', (data) => {
    io.emit('huggingface-text-summarized', data);
  });
  
  // Question answering updates
  huggingFaceService.on('question-answered', (data) => {
    io.emit('huggingface-question-answered', data);
  });
  
  // Text generation updates
  huggingFaceService.on('text-generated', (data) => {
    io.emit('huggingface-text-generated', data);
  });
  
  // Embeddings updates
  huggingFaceService.on('embeddings-generated', (data) => {
    io.emit('huggingface-embeddings-generated', data);
  });
  
  // Batch processing updates
  huggingFaceService.on('batch-processed', (data) => {
    io.emit('huggingface-batch-processed', data);
  });
}

// Background jobs for real-time data
function startBackgroundJobs() {
  // Update market data every 5 minutes
  setInterval(async () => {
    try {
      const marketData = await MarketDataService.fetchLatestData();
      io.emit('market-update', marketData);
    } catch (error) {
      console.error('Market data update failed:', error);
    }
  }, 5 * 60 * 1000);

  // Update news every 15 minutes
  setInterval(async () => {
    try {
      const news = await NewsService.fetchLatestNews();
      io.emit('news-update', news);
    } catch (error) {
      console.error('News update failed:', error);
    }
  }, 15 * 60 * 1000);

  // AI analysis every hour
  setInterval(async () => {
    try {
      const analysis = await AIService.generateMarketAnalysis();
      io.emit('ai-analysis', analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }, 60 * 60 * 1000);
}

// Start server
async function startServer() {
  await initializeServices();
  
  // Configure server timeouts for Render.com
  server.keepAliveTimeout = 120000; // 2 minutes
  server.headersTimeout = 120000;   // 2 minutes
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Host: 0.0.0.0`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

startServer().catch(console.error);
