// error-check.js
// Comprehensive error checking script for JamStockAnalytics

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Error checking configuration
 */
const ERROR_CHECK_CONFIG = {
  // File patterns to check
  filePatterns: [
    '**/*.js',
    '**/*.json',
    '**/*.yml',
    '**/*.yaml',
    '**/*.md'
  ],
  
  // Directories to exclude
  excludeDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage'
  ],
  
  // Error types to check
  errorTypes: [
    'syntax',
    'linting',
    'dependencies',
    'security',
    'performance',
    'accessibility'
  ]
};

/**
 * Main error checking class
 */
class ErrorChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixed = [];
  }

  /**
   * Run all error checks
   */
  async runAllChecks() {
    console.log('🔍 Starting comprehensive error check...');
    console.log('=====================================');

    try {
      await this.checkSyntaxErrors();
      await this.checkLintingErrors();
      await this.checkDependencyErrors();
      await this.checkSecurityIssues();
      await this.checkPerformanceIssues();
      await this.checkAccessibilityIssues();
      await this.checkConfigurationErrors();
      await this.checkWebhookErrors();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error during checking process:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check for syntax errors
   */
  async checkSyntaxErrors() {
    console.log('📝 Checking syntax errors...');
    
    const jsFiles = this.getFilesByPattern('**/*.js');
    
    for (const file of jsFiles) {
      try {
        execSync(`node -c "${file}"`, { stdio: 'pipe' });
      } catch (error) {
        this.errors.push({
          type: 'syntax',
          file,
          message: `Syntax error in ${file}`,
          details: error.message
        });
      }
    }
    
    console.log(`✅ Syntax check complete: ${this.errors.filter(e => e.type === 'syntax').length} errors found`);
  }

  /**
   * Check for linting errors
   */
  async checkLintingErrors() {
    console.log('🧹 Checking linting errors...');
    
    try {
      // Check if ESLint is available
      execSync('npx eslint --version', { stdio: 'pipe' });
      
      const result = execSync('npx eslint . --format json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const lintResults = JSON.parse(result);
      
      for (const file of lintResults) {
        for (const message of file.messages) {
          if (message.severity === 2) {
            this.errors.push({
              type: 'linting',
              file: file.filePath,
              message: message.message,
              line: message.line,
              column: message.column,
              rule: message.ruleId
            });
          } else if (message.severity === 1) {
            this.warnings.push({
              type: 'linting',
              file: file.filePath,
              message: message.message,
              line: message.line,
              column: message.column,
              rule: message.ruleId
            });
          }
        }
      }
      
    } catch (error) {
      console.log('⚠️  ESLint not available, skipping linting checks');
    }
    
    console.log(`✅ Linting check complete: ${this.errors.filter(e => e.type === 'linting').length} errors, ${this.warnings.filter(w => w.type === 'linting').length} warnings`);
  }

  /**
   * Check for dependency errors
   */
  async checkDependencyErrors() {
    console.log('📦 Checking dependency errors...');
    
    // Check package.json
    if (fs.existsSync('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check for missing dependencies
        if (packageJson.dependencies) {
          for (const [dep, version] of Object.entries(packageJson.dependencies)) {
            try {
              require.resolve(dep);
            } catch (error) {
              this.errors.push({
                type: 'dependencies',
                file: 'package.json',
                message: `Missing dependency: ${dep}`,
                details: `Version: ${version}`
              });
            }
          }
        }
        
        // Check for security vulnerabilities
        try {
          execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
        } catch (error) {
          this.warnings.push({
            type: 'security',
            file: 'package.json',
            message: 'Security vulnerabilities found in dependencies',
            details: 'Run npm audit for details'
          });
        }
        
      } catch (error) {
        this.errors.push({
          type: 'dependencies',
          file: 'package.json',
          message: 'Invalid package.json format',
          details: error.message
        });
      }
    }
    
    console.log(`✅ Dependency check complete: ${this.errors.filter(e => e.type === 'dependencies').length} errors`);
  }

  /**
   * Check for security issues
   */
  async checkSecurityIssues() {
    console.log('🔒 Checking security issues...');
    
    // Check for sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'config.json',
      'secrets.json',
      '*.key',
      '*.pem',
      '*.p12'
    ];
    
    for (const pattern of sensitiveFiles) {
      const files = this.getFilesByPattern(pattern);
      for (const file of files) {
        this.warnings.push({
          type: 'security',
          file,
          message: 'Sensitive file detected',
          details: 'Consider adding to .gitignore'
        });
      }
    }
    
    // Check for hardcoded secrets
    const jsFiles = this.getFilesByPattern('**/*.js');
    const secretPatterns = [
      /password\s*=\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
      /secret\s*=\s*['"][^'"]+['"]/i,
      /token\s*=\s*['"][^'"]+['"]/i
    ];
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            this.warnings.push({
              type: 'security',
              file,
              message: 'Potential hardcoded secret detected',
              details: 'Consider using environment variables'
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`✅ Security check complete: ${this.warnings.filter(w => w.type === 'security').length} warnings`);
  }

  /**
   * Check for performance issues
   */
  async checkPerformanceIssues() {
    console.log('⚡ Checking performance issues...');
    
    // Check for large files
    const allFiles = this.getFilesByPattern('**/*');
    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        if (stats.size > 10 * 1024 * 1024) { // 10MB
          this.warnings.push({
            type: 'performance',
            file,
            message: 'Large file detected',
            details: `Size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`
          });
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    }
    
    // Check for potential memory leaks in JS files
    const jsFiles = this.getFilesByPattern('**/*.js');
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for common memory leak patterns
        const leakPatterns = [
          /setInterval\s*\(/g,
          /setTimeout\s*\(/g,
          /addEventListener\s*\(/g
        ];
        
        for (const pattern of leakPatterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 5) {
            this.warnings.push({
              type: 'performance',
              file,
              message: 'Potential memory leak detected',
              details: `Multiple ${pattern.source} calls found`
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`✅ Performance check complete: ${this.warnings.filter(w => w.type === 'performance').length} warnings`);
  }

  /**
   * Check for accessibility issues
   */
  async checkAccessibilityIssues() {
    console.log('♿ Checking accessibility issues...');
    
    const htmlFiles = this.getFilesByPattern('**/*.html');
    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for missing alt attributes
        if (content.includes('<img') && !content.includes('alt=')) {
          this.warnings.push({
            type: 'accessibility',
            file,
            message: 'Images without alt attributes detected',
            details: 'Add alt attributes to all images'
          });
        }
        
        // Check for missing form labels
        if (content.includes('<input') && !content.includes('<label')) {
          this.warnings.push({
            type: 'accessibility',
            file,
            message: 'Form inputs without labels detected',
            details: 'Add labels to all form inputs'
          });
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`✅ Accessibility check complete: ${this.warnings.filter(w => w.type === 'accessibility').length} warnings`);
  }

  /**
   * Check for configuration errors
   */
  async checkConfigurationErrors() {
    console.log('⚙️  Checking configuration errors...');
    
    // Check render.yaml
    if (fs.existsSync('render.yaml')) {
      try {
        const content = fs.readFileSync('render.yaml', 'utf8');
        
        // Check for required fields
        if (!content.includes('services:')) {
          this.errors.push({
            type: 'configuration',
            file: 'render.yaml',
            message: 'Missing services configuration',
            details: 'Add services section to render.yaml'
          });
        }
        
        if (!content.includes('buildCommand:')) {
          this.errors.push({
            type: 'configuration',
            file: 'render.yaml',
            message: 'Missing buildCommand',
            details: 'Add buildCommand to render.yaml'
          });
        }
        
      } catch (error) {
        this.errors.push({
          type: 'configuration',
          file: 'render.yaml',
          message: 'Invalid YAML format',
          details: error.message
        });
      }
    }
    
    // Check package.json
    if (fs.existsSync('package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!packageJson.scripts || !packageJson.scripts.start) {
          this.errors.push({
            type: 'configuration',
            file: 'package.json',
            message: 'Missing start script',
            details: 'Add start script to package.json'
          });
        }
        
      } catch (error) {
        this.errors.push({
          type: 'configuration',
          file: 'package.json',
          message: 'Invalid JSON format',
          details: error.message
        });
      }
    }
    
    console.log(`✅ Configuration check complete: ${this.errors.filter(e => e.type === 'configuration').length} errors`);
  }

  /**
   * Check for webhook errors
   */
  async checkWebhookErrors() {
    console.log('🔗 Checking webhook errors...');
    
    // Check webhook-handler.js
    if (fs.existsSync('webhook-handler.js')) {
      try {
        execSync('node -c webhook-handler.js', { stdio: 'pipe' });
      } catch (error) {
        this.errors.push({
          type: 'webhook',
          file: 'webhook-handler.js',
          message: 'Webhook handler syntax error',
          details: error.message
        });
      }
    }
    
    // Check webhook configuration
    if (fs.existsSync('render.yaml')) {
      const content = fs.readFileSync('render.yaml', 'utf8');
      if (content.includes('webhook') && !content.includes('WEBHOOK_SECRET')) {
        this.warnings.push({
          type: 'webhook',
          file: 'render.yaml',
          message: 'Webhook secret not configured',
          details: 'Add WEBHOOK_SECRET to environment variables'
        });
      }
    }
    
    console.log(`✅ Webhook check complete: ${this.errors.filter(e => e.type === 'webhook').length} errors`);
  }

  /**
   * Get files by pattern
   */
  getFilesByPattern(pattern) {
    try {
      const result = execSync(`find . -name "${pattern}" -type f`, { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      return result.trim().split('\n').filter(file => {
        // Filter out excluded directories
        return !ERROR_CHECK_CONFIG.excludeDirs.some(dir => file.includes(dir));
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate error report
   */
  generateReport() {
    console.log('\n📊 Error Check Report');
    console.log('====================');
    
    console.log(`\n❌ Errors found: ${this.errors.length}`);
    if (this.errors.length > 0) {
      this.errors.forEach(error => {
        console.log(`  - ${error.type.toUpperCase()}: ${error.file}`);
        console.log(`    ${error.message}`);
        if (error.details) {
          console.log(`    Details: ${error.details}`);
        }
      });
    }
    
    console.log(`\n⚠️  Warnings found: ${this.warnings.length}`);
    if (this.warnings.length > 0) {
      this.warnings.forEach(warning => {
        console.log(`  - ${warning.type.toUpperCase()}: ${warning.file}`);
        console.log(`    ${warning.message}`);
        if (warning.details) {
          console.log(`    Details: ${warning.details}`);
        }
      });
    }
    
    console.log(`\n✅ Fixed issues: ${this.fixed.length}`);
    if (this.fixed.length > 0) {
      this.fixed.forEach(fix => {
        console.log(`  - ${fix.type.toUpperCase()}: ${fix.file}`);
        console.log(`    ${fix.message}`);
      });
    }
    
    // Summary
    const totalIssues = this.errors.length + this.warnings.length;
    if (totalIssues === 0) {
      console.log('\n🎉 No issues found! Your code is clean.');
    } else {
      console.log(`\n📈 Summary: ${totalIssues} total issues found`);
      console.log(`   - ${this.errors.length} errors (must fix)`);
      console.log(`   - ${this.warnings.length} warnings (should fix)`);
    }
    
    // Exit with appropriate code
    if (this.errors.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run error check if this file is executed directly
if (require.main === module) {
  const checker = new ErrorChecker();
  checker.runAllChecks().catch(error => {
    console.error('❌ Error check failed:', error.message);
    process.exit(1);
  });
}

module.exports = ErrorChecker;
