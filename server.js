const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const newsRoutes = require('./routes/news');
const portfolioRoutes = require('./routes/portfolio');
const aiRoutes = require('./routes/ai');

// Import middleware
const authMiddleware = require('./middleware/auth');
const rateLimitMiddleware = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

// Import services
const DatabaseService = require('./services/database');
const MarketDataService = require('./services/marketData');
const AIService = require('./services/ai');
const NewsService = require('./services/news');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
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
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to market updates room
  socket.on('join-market-updates', (userId) => {
    socket.join(`market-${userId}`);
    console.log(`User ${userId} joined market updates`);
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
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    await DatabaseService.connect();
    console.log('✅ Database connected');
    
    await MarketDataService.initialize();
    console.log('✅ Market data service initialized');
    
    await AIService.initialize();
    console.log('✅ AI service initialized');
    
    await NewsService.initialize();
    console.log('✅ News service initialized');
    
    // Start background jobs
    startBackgroundJobs();
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
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
  
  server.listen(PORT, () => {
    console.log(`🚀 JamStockAnalytics Production Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📈 Real-time features enabled`);
    console.log(`🤖 AI processing active`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer().catch(console.error);
