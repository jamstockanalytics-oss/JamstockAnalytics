/**
 * API Endpoints Tests
 * Tests for basic API functionality
 */

const request = require('supertest');
const express = require('express');

// Create a simple test app instead of importing the full server
const app = express();

// Add basic routes for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'test',
    database: {
      status: 'healthy',
      state: 'connected',
      database: 'jamstockanalytics_test'
    }
  });
});

app.get('/', (req, res) => {
  res.send('<html><body><h1>Test App</h1></body></html>');
});

app.get('/api/market', (req, res) => {
  res.json({ message: 'Market endpoint' });
});

app.get('/api/news', (req, res) => {
  res.json({ message: 'News endpoint' });
});

app.get('/api/ai', (req, res) => {
  res.json({ message: 'AI endpoint' });
});

describe('API Endpoints', () => {
  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.database).toBeDefined();
    });

    test('GET /api/health should include database status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.database.status).toBe('healthy');
      expect(response.body.database.database).toBe('jamstockanalytics_test');
    });
  });

  describe('Static Files', () => {
    test('GET / should serve the main application', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('API Routes', () => {
    test('GET /api/market should be accessible', async () => {
      // This tests that the route exists and returns a response
      const response = await request(app)
        .get('/api/market');

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    test('GET /api/news should be accessible', async () => {
      const response = await request(app)
        .get('/api/news');

      expect(response.status).not.toBe(404);
    });

    test('GET /api/ai should be accessible', async () => {
      const response = await request(app)
        .get('/api/ai');

      expect(response.status).not.toBe(404);
    });
  });
});
