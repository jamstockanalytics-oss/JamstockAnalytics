#!/usr/bin/env node

// Performance optimization script for JamStockAnalytics
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceOptimizer {
  constructor() {
    this.optimizations = [];
    this.results = {};
  }
  
  async runOptimizations() {
    console.log('🚀 Starting performance optimizations...\n');
    
    try {
      // 1. Bundle analysis
      await this.analyzeBundle();
      
      // 2. CSS optimization
      await this.optimizeCSS();
      
      // 3. Image optimization
      await this.optimizeImages();
      
      // 4. JavaScript optimization
      await this.optimizeJavaScript();
      
      // 5. Server optimization
      await this.optimizeServer();
      
      // 6. Generate report
      this.generateReport();
      
      console.log('\n✅ Performance optimizations completed!');
      
    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      process.exit(1);
    }
  }
  
  async analyzeBundle() {
    console.log('📊 Analyzing bundle size...');
    
    try {
      // Run webpack bundle analyzer
      execSync('npm run build:analyze', { stdio: 'inherit' });
      
      this.optimizations.push({
        type: 'bundle-analysis',
        status: 'completed',
        message: 'Bundle analysis completed'
      });
      
    } catch (error) {
      console.warn('⚠️  Bundle analysis failed:', error.message);
    }
  }
  
  async optimizeCSS() {
    console.log('🎨 Optimizing CSS...');
    
    const cssPath = path.join(__dirname, '..', 'static', 'css', 'main.css');
    
    if (fs.existsSync(cssPath)) {
      let css = fs.readFileSync(cssPath, 'utf8');
      
      // Remove comments
      css = css.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove extra whitespace
      css = css.replace(/\s+/g, ' ');
      css = css.replace(/;\s*}/g, '}');
      css = css.replace(/{\s*/g, '{');
      css = css.replace(/;\s*/g, ';');
      
      // Write optimized CSS
      fs.writeFileSync(cssPath, css);
      
      this.optimizations.push({
        type: 'css-optimization',
        status: 'completed',
        message: 'CSS minified and optimized'
      });
    }
  }
  
  async optimizeImages() {
    console.log('🖼️  Optimizing images...');
    
    const staticPath = path.join(__dirname, '..', 'static');
    const publicPath = path.join(__dirname, '..', 'public');
    
    // Check for images in static and public directories
    const imageDirs = [staticPath, publicPath].filter(dir => fs.existsSync(dir));
    
    for (const dir of imageDirs) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile() && /\.(jpg|jpeg|png|gif|svg)$/i.test(file.name)) {
          const filePath = path.join(dir, file.name);
          const stats = fs.statSync(filePath);
          
          // Log large images
          if (stats.size > 100000) { // 100KB
            console.log(`  📸 Large image found: ${file.name} (${Math.round(stats.size / 1024)}KB)`);
          }
        }
      }
    }
    
    this.optimizations.push({
      type: 'image-optimization',
      status: 'completed',
      message: 'Image analysis completed'
    });
  }
  
  async optimizeJavaScript() {
    console.log('⚡ Optimizing JavaScript...');
    
    const jsPath = path.join(__dirname, '..', 'static', 'js', 'main.js');
    
    if (fs.existsSync(jsPath)) {
      let js = fs.readFileSync(jsPath, 'utf8');
      
      // Remove console.log statements in production
      if (process.env.NODE_ENV === 'production') {
        js = js.replace(/console\.(log|info|debug)\([^)]*\);?\s*/g, '');
      }
      
      // Remove extra whitespace
      js = js.replace(/\s+/g, ' ');
      js = js.replace(/;\s*}/g, '}');
      js = js.replace(/{\s*/g, '{');
      
      // Write optimized JavaScript
      fs.writeFileSync(jsPath, js);
      
      this.optimizations.push({
        type: 'javascript-optimization',
        status: 'completed',
        message: 'JavaScript optimized'
      });
    }
  }
  
  async optimizeServer() {
    console.log('🖥️  Optimizing server configuration...');
    
    const serverPath = path.join(__dirname, '..', 'server.js');
    
    if (fs.existsSync(serverPath)) {
      let server = fs.readFileSync(serverPath, 'utf8');
      
      // Check for performance optimizations
      const hasCompression = server.includes('compression');
      const hasCaching = server.includes('cache');
      const hasPerformanceMonitoring = server.includes('performance');
      
      const optimizations = [];
      
      if (hasCompression) optimizations.push('compression');
      if (hasCaching) optimizations.push('caching');
      if (hasPerformanceMonitoring) optimizations.push('performance monitoring');
      
      this.optimizations.push({
        type: 'server-optimization',
        status: 'completed',
        message: `Server optimizations: ${optimizations.join(', ')}`
      });
    }
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: this.optimizations,
      summary: {
        total: this.optimizations.length,
        completed: this.optimizations.filter(opt => opt.status === 'completed').length,
        failed: this.optimizations.filter(opt => opt.status === 'failed').length
      }
    };
    
    const reportPath = path.join(__dirname, '..', 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📋 Optimization report generated: ${reportPath}`);
    
    // Display summary
    console.log('\n📊 Optimization Summary:');
    console.log(`  ✅ Completed: ${report.summary.completed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  📈 Total: ${report.summary.total}`);
  }
  
  // Performance budget validation
  validatePerformanceBudget() {
    const budget = {
      bundleSize: 500000, // 500KB
      cssSize: 50000,     // 50KB
      jsSize: 100000,     // 100KB
      imageSize: 100000   // 100KB per image
    };
    
    const violations = [];
    
    // Check bundle size
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      for (const file of files) {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.size > budget.bundleSize) {
          violations.push(`Bundle ${file}: ${Math.round(stats.size / 1024)}KB (budget: ${Math.round(budget.bundleSize / 1024)}KB)`);
        }
      }
    }
    
    // Check CSS size
    const cssPath = path.join(__dirname, '..', 'static', 'css', 'main.css');
    if (fs.existsSync(cssPath)) {
      const stats = fs.statSync(cssPath);
      if (stats.size > budget.cssSize) {
        violations.push(`CSS: ${Math.round(stats.size / 1024)}KB (budget: ${Math.round(budget.cssSize / 1024)}KB)`);
      }
    }
    
    // Check JS size
    const jsPath = path.join(__dirname, '..', 'static', 'js', 'main.js');
    if (fs.existsSync(jsPath)) {
      const stats = fs.statSync(jsPath);
      if (stats.size > budget.jsSize) {
        violations.push(`JavaScript: ${Math.round(stats.size / 1024)}KB (budget: ${Math.round(budget.jsSize / 1024)}KB)`);
      }
    }
    
    if (violations.length > 0) {
      console.warn('\n⚠️  Performance Budget Violations:');
      violations.forEach(violation => console.warn(`  - ${violation}`));
      console.warn('');
    } else {
      console.log('\n✅ All performance budgets met!');
    }
    
    return violations;
  }
}

// Run optimizations if called directly
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer.runOptimizations().then(() => {
    optimizer.validatePerformanceBudget();
  });
}

module.exports = PerformanceOptimizer;
