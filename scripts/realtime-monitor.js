#!/usr/bin/env node

// Real-time Monitoring Script for JamStockAnalytics
const io = require('socket.io-client');

class RealtimeMonitor {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.monitoringData = {
      startTime: new Date(),
      connections: 0,
      messagesReceived: 0,
      marketUpdates: 0,
      newsUpdates: 0,
      aiUpdates: 0,
      errors: 0
    };
    this.serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  }
  
  start() {
    console.log('🚀 Starting Real-time Monitor...\n');
    
    this.connect();
    this.setupEventHandlers();
    this.startStatusReporting();
  }
  
  connect() {
    this.socket = io(this.serverUrl);
    
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.monitoringData.connections++;
      console.log('✅ Connected to real-time service');
    });
    
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Disconnected from real-time service');
    });
    
    this.socket.on('connect_error', (error) => {
      this.monitoringData.errors++;
      console.error('❌ Connection error:', error.message);
    });
  }
  
  setupEventHandlers() {
    // Market data handlers
    this.socket.on('market-update', (data) => {
      this.monitoringData.marketUpdates++;
      this.monitoringData.messagesReceived++;
      console.log(`📊 Market update received: ${data.timestamp}`);
    });
    
    this.socket.on('market-data', (data) => {
      this.monitoringData.messagesReceived++;
      console.log(`📊 Market data received: ${data.symbol || 'all'}`);
    });
    
    // News handlers
    this.socket.on('news-update', (data) => {
      this.monitoringData.newsUpdates++;
      this.monitoringData.messagesReceived++;
      console.log(`📰 News update received: ${data.timestamp}`);
    });
    
    this.socket.on('news-data', (data) => {
      this.monitoringData.messagesReceived++;
      console.log(`📰 News data received: ${data.symbol || 'all'}`);
    });
    
    // AI insights handlers
    this.socket.on('ai-insights-update', (data) => {
      this.monitoringData.aiUpdates++;
      this.monitoringData.messagesReceived++;
      console.log(`🤖 AI insights update received: ${data.timestamp}`);
    });
    
    this.socket.on('ai-insights-data', (data) => {
      this.monitoringData.messagesReceived++;
      console.log(`🤖 AI insights data received: ${data.symbol || 'all'}`);
    });
    
    // System handlers
    this.socket.on('welcome', (data) => {
      this.monitoringData.messagesReceived++;
      console.log(`👋 Welcome message received: ${data.message}`);
    });
  }
  
  startStatusReporting() {
    // Report status every 30 seconds
    setInterval(() => {
      this.reportStatus();
    }, 30000);
    
    // Subscribe to all data types
    setTimeout(() => {
      this.subscribeToAll();
    }, 2000);
  }
  
  subscribeToAll() {
    if (!this.isConnected) {
      console.log('⚠️ Not connected, skipping subscriptions');
      return;
    }
    
    console.log('📡 Subscribing to all data types...');
    
    // Subscribe to market data
    this.socket.emit('subscribe', {
      type: 'market-data',
      symbol: null
    });
    
    // Subscribe to news
    this.socket.emit('subscribe', {
      type: 'news',
      symbol: null
    });
    
    // Subscribe to AI insights
    this.socket.emit('subscribe', {
      type: 'ai-insights',
      symbol: null
    });
    
    console.log('✅ Subscribed to all data types');
  }
  
  reportStatus() {
    const uptime = Math.floor((new Date() - this.monitoringData.startTime) / 1000);
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    
    console.log('\n📊 Real-time Monitor Status:');
    console.log(`  ⏱️  Uptime: ${minutes}m ${seconds}s`);
    console.log(`  🔌 Connected: ${this.isConnected ? 'Yes' : 'No'}`);
    console.log(`  📡 Messages Received: ${this.monitoringData.messagesReceived}`);
    console.log(`  📊 Market Updates: ${this.monitoringData.marketUpdates}`);
    console.log(`  📰 News Updates: ${this.monitoringData.newsUpdates}`);
    console.log(`  🤖 AI Updates: ${this.monitoringData.aiUpdates}`);
    console.log(`  ❌ Errors: ${this.monitoringData.errors}`);
    console.log('===========================\n');
  }
  
  getStatus() {
    return {
      isConnected: this.isConnected,
      uptime: new Date() - this.monitoringData.startTime,
      ...this.monitoringData
    };
  }
  
  stop() {
    console.log('🛑 Stopping real-time monitor...');
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down real-time monitor...');
  process.exit(0);
});

// Run monitor if called directly
if (require.main === module) {
  const monitor = new RealtimeMonitor();
  monitor.start();
  
  // Keep the process running
  process.stdin.resume();
}

module.exports = RealtimeMonitor;
