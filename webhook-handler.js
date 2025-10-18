#!/usr/bin/env node

/**
 * Docker Hub Webhook Handler for JamStockAnalytics
 * This script handles webhook events from Docker Hub and triggers deployments
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.WEBHOOK_PORT || 3000;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const DOCKER_IMAGE = 'jamstockanalytics/jamstockanalytics';
const DEPLOYMENT_SCRIPT = path.join(__dirname, 'deploy-on-webhook.sh');

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// Verify webhook signature
function verifySignature(payload, signature) {
  if (!SECRET) {
    log('WARNING: No webhook secret configured', 'WARN');
    return true;
  }
  
  // Check if signature exists
  if (!signature) {
    log('WARNING: No signature provided', 'WARN');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
    
  const providedSignature = signature.replace('sha256=', '');
  
  // Ensure both signatures are the same length for timingSafeEqual
  if (expectedSignature.length !== providedSignature.length) {
    log(`Signature length mismatch: expected ${expectedSignature.length}, got ${providedSignature.length}`, 'WARN');
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
}

// Handle deployment
async function handleDeployment(pushData) {
  try {
    log('Starting deployment process...');
    
    // Check if the push is for our image
    const repository = pushData.repository;
    if (repository.repo_name !== DOCKER_IMAGE) {
      log(`Ignoring push for ${repository.repo_name}, expected ${DOCKER_IMAGE}`);
      return;
    }
    
    // Check if it's a tag push (not just a build)
    const pushDataStr = JSON.stringify(pushData);
    if (!pushDataStr.includes('"tag":')) {
      log('No tag information in push data, skipping deployment');
      return;
    }
    
    log(`Deploying image: ${repository.repo_name}:${pushData.push_data.tag}`);
    
    // Execute deployment script (Windows or Linux)
    const isWindows = process.platform === 'win32';
    const scriptPath = isWindows 
      ? path.join(__dirname, 'deploy-on-webhook.ps1')
      : path.join(__dirname, 'deploy-on-webhook.sh');
    
    if (fs.existsSync(scriptPath)) {
      const command = isWindows 
        ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash ${scriptPath}`;
        
      exec(command, (error, stdout, stderr) => {
        if (error) {
          log(`Deployment failed: ${error.message}`, 'ERROR');
          return;
        }
        log(`Deployment output: ${stdout}`);
        if (stderr) {
          log(`Deployment stderr: ${stderr}`, 'WARN');
        }
      });
    } else {
      log(`Deployment script not found at ${scriptPath}`, 'ERROR');
    }
    
  } catch (error) {
    log(`Error during deployment: ${error.message}`, 'ERROR');
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const signature = req.headers['x-hub-signature-256'];
        
        log(`Received webhook request with signature: ${signature ? 'present' : 'missing'}`);
        
        // Verify signature
        if (!verifySignature(body, signature)) {
          log('Invalid webhook signature', 'ERROR');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
        
        const pushData = JSON.parse(body);
        log(`Received webhook for ${pushData.repository?.repo_name || 'unknown'}`);
        
        // Handle the deployment
        handleDeployment(pushData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
        
      } catch (error) {
        log(`Error processing webhook: ${error.message}`, 'ERROR');
        log(`Error stack: ${error.stack}`, 'ERROR');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  log(`Webhook handler listening on port ${PORT}`);
  log(`Health check: http://localhost:${PORT}/health`);
  log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  log(`Server started successfully on ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  log(`Server error: ${error.message}`, 'ERROR');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});
