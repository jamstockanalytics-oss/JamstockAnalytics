/**
 * Secrets Validation Package
 * Advanced validation for sensitive configuration and secrets
 * 
 * Features:
 * - Security-focused validation
 * - Pattern matching for different secret types
 * - Entropy analysis for password strength
 * - Integration with external services
 * - Comprehensive security reporting
 */

import { z } from 'zod';
import crypto from 'crypto';

// Secret types and their validation schemas
export const SecretTypes = {
  JWT_TOKEN: 'jwt_token',
  API_KEY: 'api_key',
  DATABASE_URL: 'database_url',
  ENCRYPTION_KEY: 'encryption_key',
  PASSWORD: 'password',
  URL: 'url',
  EMAIL: 'email',
  UUID: 'uuid'
} as const;

export type SecretType = typeof SecretTypes[keyof typeof SecretTypes];

// Secret validation configuration
export interface SecretConfig {
  type: SecretType;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  entropy?: number;
  description: string;
  example: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Comprehensive secret configurations
export const SecretConfigurations: Record<string, SecretConfig> = {
  // Supabase Secrets
  'EXPO_PUBLIC_SUPABASE_URL': {
    type: SecretTypes.URL,
    required: true,
    pattern: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/,
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co',
    securityLevel: 'medium'
  },
  
  'EXPO_PUBLIC_SUPABASE_ANON_KEY': {
    type: SecretTypes.JWT_TOKEN,
    required: true,
    minLength: 100,
    pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
    description: 'Supabase anonymous key (JWT token)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    securityLevel: 'high'
  },
  
  'SUPABASE_SERVICE_ROLE_KEY': {
    type: SecretTypes.JWT_TOKEN,
    required: true,
    minLength: 100,
    pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
    description: 'Supabase service role key (JWT token)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    securityLevel: 'critical'
  },
  
  // AI Service Secrets
  'EXPO_PUBLIC_DEEPSEEK_API_KEY': {
    type: SecretTypes.API_KEY,
    required: true,
    minLength: 20,
    pattern: /^sk-[a-zA-Z0-9]{20,}$/,
    description: 'DeepSeek API key for AI features',
    example: 'sk-your-deepseek-api-key',
    securityLevel: 'high'
  },
  
  // Optional AI Configuration
  'DEEPSEEK_API_URL': {
    type: SecretTypes.URL,
    required: false,
    pattern: /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/,
    description: 'DeepSeek API endpoint URL',
    example: 'https://api.deepseek.com/v1/chat/completions',
    securityLevel: 'low'
  },
  
  // Security Secrets
  'JWT_SECRET': {
    type: SecretTypes.ENCRYPTION_KEY,
    required: false,
    minLength: 32,
    entropy: 4.0,
    description: 'JWT signing secret',
    example: 'your-super-secret-jwt-key',
    securityLevel: 'critical'
  },
  
  'ENCRYPTION_KEY': {
    type: SecretTypes.ENCRYPTION_KEY,
    required: false,
    minLength: 32,
    entropy: 4.5,
    description: 'Data encryption key',
    example: 'your-super-secret-encryption-key',
    securityLevel: 'critical'
  },
  
  // Database Secrets
  'SUPABASE_DB_URL': {
    type: SecretTypes.DATABASE_URL,
    required: false,
    pattern: /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/,
    description: 'Direct database connection URL',
    example: 'postgresql://user:pass@host:5432/db',
    securityLevel: 'critical'
  },
  
  // Development Secrets
  'EXPO_TOKEN': {
    type: SecretTypes.API_KEY,
    required: false,
    minLength: 20,
    description: 'Expo authentication token',
    example: 'your-expo-token',
    securityLevel: 'medium'
  },
  
  'GCP_SA_KEY': {
    type: SecretTypes.API_KEY,
    required: false,
    minLength: 100,
    description: 'Google Cloud Platform service account key',
    example: '{"type": "service_account", ...}',
    securityLevel: 'critical'
  }
};

// Validation result types
export interface SecretValidationResult {
  isValid: boolean;
  score: number; // 0-100 security score
  errors: SecretError[];
  warnings: SecretWarning[];
  recommendations: SecretRecommendation[];
}

export interface SecretError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  suggestion: string;
  securityImpact: string;
}

export interface SecretWarning {
  field: string;
  message: string;
  suggestion: string;
  securityImpact: string;
}

export interface SecretRecommendation {
  field: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  securityBenefit: string;
}

export class SecretsValidator {
  private secrets: Record<string, string> = {};
  private errors: SecretError[] = [];
  private warnings: SecretWarning[] = [];
  private recommendations: SecretRecommendation[] = [];

  constructor(secrets: Record<string, string | undefined> = process.env) {
    // Filter out undefined values and convert to string
    this.secrets = Object.fromEntries(
      Object.entries(secrets).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>;
  }

  /**
   * Validate all secrets
   */
  validate(): SecretValidationResult {
    this.errors = [];
    this.warnings = [];
    this.recommendations = [];

    // Validate each configured secret
    for (const [field, config] of Object.entries(SecretConfigurations)) {
      this.validateSecret(field, config);
    }

    // Perform security analysis
    this.performSecurityAnalysis();

    // Calculate security score
    const score = this.calculateSecurityScore();

    return {
      isValid: this.errors.length === 0,
      score,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.recommendations
    };
  }

  /**
   * Validate a single secret
   */
  private validateSecret(field: string, config: SecretConfig): void {
    const value = this.secrets[field];

    // Check if required secret is missing
    if (config.required && (!value || value.trim() === '')) {
      this.errors.push({
        field,
        message: `${field} is required but not set`,
        severity: 'critical',
        suggestion: `Set ${field} in your environment configuration`,
        securityImpact: 'Critical security vulnerability - service will not function'
      });
      return;
    }

    // Skip validation if optional secret is not set
    if (!config.required && (!value || value.trim() === '')) {
      return;
    }

    // Validate length
    if (config.minLength && value.length < config.minLength) {
      this.errors.push({
        field,
        message: `${field} is too short (minimum ${config.minLength} characters)`,
        severity: 'error',
        suggestion: `Ensure ${field} is at least ${config.minLength} characters long`,
        securityImpact: 'Insufficient length may compromise security'
      });
    }

    if (config.maxLength && value.length > config.maxLength) {
      this.warnings.push({
        field,
        message: `${field} is too long (maximum ${config.maxLength} characters)`,
        suggestion: `Consider shortening ${field} to improve performance`,
        securityImpact: 'Excessive length may impact performance'
      });
    }

    // Validate pattern
    if (config.pattern && !config.pattern.test(value)) {
      this.errors.push({
        field,
        message: `${field} does not match expected format`,
        severity: 'error',
        suggestion: `Ensure ${field} follows the correct format: ${config.example}`,
        securityImpact: 'Invalid format may cause authentication failures'
      });
    }

    // Validate entropy for encryption keys
    if (config.entropy && config.type === SecretTypes.ENCRYPTION_KEY) {
      const entropy = this.calculateEntropy(value);
      if (entropy < config.entropy) {
        this.warnings.push({
          field,
          message: `${field} has low entropy (${entropy.toFixed(2)} bits)`,
          suggestion: `Use a more random key with higher entropy (minimum ${config.entropy} bits)`,
          securityImpact: 'Low entropy reduces cryptographic security'
        });
      }
    }

    // Check for placeholder values
    if (this.isPlaceholder(value)) {
      this.errors.push({
        field,
        message: `${field} contains placeholder text`,
        severity: 'critical',
        suggestion: `Replace placeholder with actual ${config.description}`,
        securityImpact: 'Placeholder values are a critical security vulnerability'
      });
    }

    // Check for common weak values
    if (this.isWeakValue(value, config.type)) {
      this.warnings.push({
        field,
        message: `${field} appears to be a weak or default value`,
        suggestion: `Use a strong, unique value for ${config.description}`,
        securityImpact: 'Weak values are easily compromised'
      });
    }
  }

  /**
   * Perform comprehensive security analysis
   */
  private performSecurityAnalysis(): void {
    // Check for duplicate secrets
    this.checkForDuplicates();

    // Check for secrets in URLs
    this.checkForSecretsInUrls();

    // Check for weak encryption
    this.checkForWeakEncryption();

    // Check for missing security headers
    this.checkForMissingSecurity();

    // Generate security recommendations
    this.generateSecurityRecommendations();
  }

  /**
   * Check for duplicate secret values
   */
  private checkForDuplicates(): void {
    const valueCounts = new Map<string, string[]>();
    
    for (const [field, value] of Object.entries(this.secrets)) {
      if (value && value.length > 10) { // Only check substantial values
        if (!valueCounts.has(value)) {
          valueCounts.set(value, []);
        }
        valueCounts.get(value)!.push(field);
      }
    }

    for (const [value, fields] of valueCounts.entries()) {
      if (fields.length > 1) {
        this.warnings.push({
          field: fields.join(', '),
          message: 'Duplicate secret values detected',
          suggestion: 'Use unique values for each secret to improve security',
          securityImpact: 'Duplicate secrets reduce security isolation'
        });
      }
    }
  }

  /**
   * Check for secrets exposed in URLs
   */
  private checkForSecretsInUrls(): void {
    for (const [field, value] of Object.entries(this.secrets)) {
      if (value && value.includes('://') && value.includes('@')) {
        this.warnings.push({
          field,
          message: 'Secret may contain credentials in URL',
          suggestion: 'Use separate fields for URL and credentials',
          securityImpact: 'Credentials in URLs may be logged or exposed'
        });
      }
    }
  }

  /**
   * Check for weak encryption practices
   */
  private checkForWeakEncryption(): void {
    const encryptionKeys = Object.entries(this.secrets)
      .filter(([field, _]) => field.includes('KEY') || field.includes('SECRET'))
      .filter(([_, value]) => value && value.length > 0);

    for (const [field, value] of encryptionKeys) {
      if (value.length < 32) {
        this.warnings.push({
          field,
          message: 'Encryption key is too short',
          suggestion: 'Use at least 32 characters for encryption keys',
          securityImpact: 'Short keys are vulnerable to brute force attacks'
        });
      }

      if (this.hasLowEntropy(value)) {
        this.warnings.push({
          field,
          message: 'Encryption key has low entropy',
          suggestion: 'Use a cryptographically secure random generator',
          securityImpact: 'Low entropy keys are predictable and insecure'
        });
      }
    }
  }

  /**
   * Check for missing security configurations
   */
  private checkForMissingSecurity(): void {
    const hasJwtSecret = !!this.secrets.JWT_SECRET;
    const hasEncryptionKey = !!this.secrets.ENCRYPTION_KEY;
    const hasServiceRoleKey = !!this.secrets.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasJwtSecret) {
      this.recommendations.push({
        field: 'JWT_SECRET',
        recommendation: 'Configure JWT_SECRET for secure token signing',
        priority: 'high',
        securityBenefit: 'Prevents token forgery and improves authentication security'
      });
    }

    if (!hasEncryptionKey) {
      this.recommendations.push({
        field: 'ENCRYPTION_KEY',
        recommendation: 'Configure ENCRYPTION_KEY for data encryption',
        priority: 'medium',
        securityBenefit: 'Enables encryption of sensitive data at rest'
      });
    }

    if (!hasServiceRoleKey) {
      this.warnings.push({
        field: 'SUPABASE_SERVICE_ROLE_KEY',
        message: 'Service role key not configured',
        suggestion: 'Configure service role key for server-side operations',
        securityImpact: 'Some features may not work without service role access'
      });
    }
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(): void {
    // Check for HTTPS usage
    const urls = Object.values(this.secrets).filter(value => 
      value && value.startsWith('http')
    );
    
    const httpUrls = urls.filter(url => url.startsWith('http://'));
    if (httpUrls.length > 0) {
      this.recommendations.push({
        field: 'URLs',
        recommendation: 'Use HTTPS for all URLs',
        priority: 'critical',
        securityBenefit: 'Prevents man-in-the-middle attacks and data interception'
      });
    }

    // Check for environment-specific recommendations
    const nodeEnv = this.secrets.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      this.recommendations.push({
        field: 'NODE_ENV',
        recommendation: 'Review all secrets for production readiness',
        priority: 'critical',
        securityBenefit: 'Ensures production environment is properly secured'
      });
    }
  }

  /**
   * Calculate entropy of a string
   */
  private calculateEntropy(str: string): number {
    const freq = new Map<string, number>();
    for (const char of str) {
      freq.set(char, (freq.get(char) || 0) + 1);
    }

    let entropy = 0;
    const length = str.length;
    
    for (const count of freq.values()) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * Check if value is a placeholder
   */
  private isPlaceholder(value: string): boolean {
    const placeholderPatterns = [
      /your[_-]?[a-zA-Z0-9_-]+/gi,
      /placeholder/gi,
      /example/gi,
      /test[_-]?[a-zA-Z0-9_-]+/gi,
      /demo/gi,
      /sample/gi,
      /dummy/gi,
      /fake/gi,
      /mock/gi,
      /changeme/gi,
      /replace/gi
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check if value is weak
   */
  private isWeakValue(value: string, type: SecretType): boolean {
    const weakValues = [
      'password', '123456', 'admin', 'secret', 'key', 'token',
      'test', 'demo', 'example', 'default', 'changeme'
    ];

    return weakValues.some(weak => 
      value.toLowerCase().includes(weak.toLowerCase())
    );
  }

  /**
   * Check if value has low entropy
   */
  private hasLowEntropy(value: string): boolean {
    const entropy = this.calculateEntropy(value);
    return entropy < 3.0; // Less than 3 bits of entropy per character
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(): number {
    let score = 100;
    
    // Deduct points for errors
    for (const error of this.errors) {
      if (error.severity === 'critical') score -= 20;
      else if (error.severity === 'error') score -= 10;
    }
    
    // Deduct points for warnings
    score -= this.warnings.length * 2;
    
    // Bonus points for security features
    if (this.secrets.JWT_SECRET) score += 5;
    if (this.secrets.ENCRYPTION_KEY) score += 5;
    if (this.secrets.SUPABASE_SERVICE_ROLE_KEY) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get security report
   */
  getSecurityReport(): string {
    const result = this.validate();
    
    let report = '🔒 Secrets Security Report\n\n';
    report += `Security Score: ${result.score}/100\n\n`;
    
    if (result.errors.length > 0) {
      report += '❌ Critical Issues:\n';
      result.errors.forEach(error => {
        report += `  • ${error.field}: ${error.message}\n`;
        report += `    💡 ${error.suggestion}\n`;
        report += `    ⚠️  ${error.securityImpact}\n\n`;
      });
    }
    
    if (result.warnings.length > 0) {
      report += '⚠️  Security Warnings:\n';
      result.warnings.forEach(warning => {
        report += `  • ${warning.field}: ${warning.message}\n`;
        report += `    💡 ${warning.suggestion}\n\n`;
      });
    }
    
    if (result.recommendations.length > 0) {
      report += '💡 Security Recommendations:\n';
      result.recommendations.forEach(rec => {
        const priority = rec.priority.toUpperCase();
        report += `  • [${priority}] ${rec.field}: ${rec.recommendation}\n`;
        report += `    🔒 ${rec.securityBenefit}\n\n`;
      });
    }
    
    if (result.score >= 80) {
      report += '✅ Good security posture\n';
    } else if (result.score >= 60) {
      report += '⚠️  Security improvements needed\n';
    } else {
      report += '❌ Critical security issues detected\n';
    }
    
    return report;
  }
}

// Export convenience functions
export function validateSecrets(secrets: Record<string, string | undefined> = process.env): SecretValidationResult {
  const validator = new SecretsValidator(secrets);
  return validator.validate();
}

export function getSecurityScore(secrets: Record<string, string | undefined> = process.env): number {
  const validator = new SecretsValidator(secrets);
  return validator.validate().score;
}

// Export for use in other modules
export { SecretConfigurations, SecretTypes };
