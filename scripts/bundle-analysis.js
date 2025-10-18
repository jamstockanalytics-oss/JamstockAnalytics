#!/usr/bin/env node

// Bundle analysis script for JamStockAnalytics
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      files: [],
      totalSize: 0,
      recommendations: []
    };
  }
  
  async analyze() {
    console.log('📊 Analyzing bundle size...\n');
    
    try {
      // Analyze static files
      await this.analyzeStaticFiles();
      
      // Analyze CSS
      await this.analyzeCSS();
      
      // Analyze JavaScript
      await this.analyzeJavaScript();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Save report
      this.saveReport();
      
      console.log('\n✅ Bundle analysis completed!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }
  
  async analyzeStaticFiles() {
    const staticPath = path.join(__dirname, '..', 'static');
    const publicPath = path.join(__dirname, '..', 'public');
    
    const dirs = [staticPath, publicPath].filter(dir => fs.existsSync(dir));
    
    for (const dir of dirs) {
      const files = fs.readdirSync(dir, { recursive: true });
      
      for (const file of files) {
        if (typeof file === 'string') {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            const sizeKB = Math.round(stats.size / 1024);
            this.analysis.files.push({
              path: file,
              size: stats.size,
              sizeKB: sizeKB,
              type: this.getFileType(file)
            });
            
            this.analysis.totalSize += stats.size;
            
            if (sizeKB > 100) {
              console.log(`📁 ${file}: ${sizeKB}KB`);
            }
          }
        }
      }
    }
  }
  
  async analyzeCSS() {
    const cssPath = path.join(__dirname, '..', 'static', 'css', 'main.css');
    
    if (fs.existsSync(cssPath)) {
      const stats = fs.statSync(cssPath);
      const sizeKB = Math.round(stats.size / 1024);
      
      console.log(`🎨 CSS: ${sizeKB}KB`);
      
      if (sizeKB > 50) {
        this.analysis.recommendations.push({
          type: 'css',
          message: `CSS file is ${sizeKB}KB (budget: 50KB). Consider minification.`,
          priority: 'medium'
        });
      }
    }
  }
  
  async analyzeJavaScript() {
    const jsPath = path.join(__dirname, '..', 'static', 'js', 'main.js');
    
    if (fs.existsSync(jsPath)) {
      const stats = fs.statSync(jsPath);
      const sizeKB = Math.round(stats.size / 1024);
      
      console.log(`⚡ JavaScript: ${sizeKB}KB`);
      
      if (sizeKB > 100) {
        this.analysis.recommendations.push({
          type: 'javascript',
          message: `JavaScript file is ${sizeKB}KB (budget: 100KB). Consider code splitting.`,
          priority: 'high'
        });
      }
    }
  }
  
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      '.css': 'stylesheet',
      '.js': 'script',
      '.html': 'document',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.ico': 'image'
    };
    return types[ext] || 'other';
  }
  
  generateRecommendations() {
    const totalSizeKB = Math.round(this.analysis.totalSize / 1024);
    
    console.log(`\n📊 Bundle Analysis Summary:`);
    console.log(`  Total Size: ${totalSizeKB}KB`);
    console.log(`  Files: ${this.analysis.files.length}`);
    
    // Size recommendations
    if (totalSizeKB > 500) {
      this.analysis.recommendations.push({
        type: 'size',
        message: `Total bundle size is ${totalSizeKB}KB (budget: 500KB). Consider optimization.`,
        priority: 'high'
      });
    }
    
    // Image recommendations
    const images = this.analysis.files.filter(f => f.type === 'image');
    const largeImages = images.filter(f => f.sizeKB > 100);
    
    if (largeImages.length > 0) {
      this.analysis.recommendations.push({
        type: 'images',
        message: `${largeImages.length} large images found. Consider compression.`,
        priority: 'medium'
      });
    }
    
    // CSS recommendations
    const cssFiles = this.analysis.files.filter(f => f.type === 'stylesheet');
    if (cssFiles.length > 1) {
      this.analysis.recommendations.push({
        type: 'css',
        message: `${cssFiles.length} CSS files found. Consider consolidation.`,
        priority: 'low'
      });
    }
  }
  
  saveReport() {
    const reportPath = path.join(__dirname, '..', 'bundle-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    
    console.log(`\n📋 Bundle analysis report saved: ${reportPath}`);
    
    // Display recommendations
    if (this.analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.analysis.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${priority} ${rec.message}`);
      });
    } else {
      console.log('\n✅ No optimization recommendations needed!');
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze();
}

module.exports = BundleAnalyzer;
