/**
 * Configuration Validation Package
 * Comprehensive validation for application configuration and feature flags
 * 
 * Features:
 * - Feature dependency validation
 * - Configuration consistency checks
 * - Performance optimization recommendations
 * - Integration validation
 * - Deployment readiness assessment
 */

import { z } from 'zod';
import { EnvironmentConfig } from './environment-validator';
import { SecretValidationResult } from './secrets-validator';

// Configuration validation schemas
export const AppConfigSchema = z.object({
  // Core App Configuration
  appName: z.string().min(1).default('JamStockAnalytics'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Feature Flags
  features: z.object({
    ai: z.object({
      enabled: z.boolean().default(true),
      deepseek: z.boolean().default(true),
      fallback: z.boolean().default(true),
      mlAgent: z.boolean().default(true)
    }),
    auth: z.object({
      enabled: z.boolean().default(true),
      google: z.boolean().default(false),
      github: z.boolean().default(false),
      guest: z.boolean().default(true)
    }),
    analysis: z.object({
      enabled: z.boolean().default(true),
      sessions: z.boolean().default(true),
      export: z.boolean().default(true)
    }),
    social: z.object({
      comments: z.boolean().default(true),
      blocking: z.boolean().default(true),
      sharing: z.boolean().default(true)
    }),
    monitoring: z.object({
      enabled: z.boolean().default(true),
      analytics: z.boolean().default(true),
      health: z.boolean().default(true)
    })
  }),
  
  // Performance Configuration
  performance: z.object({
    cache: z.object({
      enabled: z.boolean().default(true),
      ttl: z.number().min(60).max(86400).default(3600),
      maxSize: z.number().min(100).max(10000).default(1000)
    }),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      requests: z.number().min(1).max(10000).default(100),
      window: z.number().min(1000).max(3600000).default(60000)
    }),
    optimization: z.object({
      lazyLoading: z.boolean().default(true),
      compression: z.boolean().default(true),
      minification: z.boolean().default(true)
    })
  }),
  
  // Security Configuration
  security: z.object({
    encryption: z.object({
      enabled: z.boolean().default(true),
      algorithm: z.string().default('aes-256-gcm'),
      keyRotation: z.boolean().default(false)
    }),
    authentication: z.object({
      jwtExpiry: z.number().min(300).max(86400).default(3600),
      refreshToken: z.boolean().default(true),
      mfa: z.boolean().default(false)
    }),
    dataProtection: z.object({
      rls: z.boolean().default(true),
      audit: z.boolean().default(true),
      backup: z.boolean().default(true)
    })
  })
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// Validation result types
export interface ConfigValidationResult {
  isValid: boolean;
  score: number; // 0-100 configuration score
  errors: ConfigError[];
  warnings: ConfigWarning[];
  recommendations: ConfigRecommendation[];
  readiness: DeploymentReadiness;
}

export interface ConfigError {
  category: string;
  field: string;
  message: string;
  severity: 'error' | 'critical';
  suggestion: string;
  impact: string;
}

export interface ConfigWarning {
  category: string;
  field: string;
  message: string;
  suggestion: string;
  impact: string;
}

export interface ConfigRecommendation {
  category: string;
  field: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  benefit: string;
}

export interface DeploymentReadiness {
  overall: 'ready' | 'not_ready' | 'needs_attention';
  production: boolean;
  staging: boolean;
  development: boolean;
  issues: string[];
  score: number;
}

export class ConfigValidator {
  private config: Partial<AppConfig> = {};
  private environment: EnvironmentConfig;
  private secrets: SecretValidationResult;
  private errors: ConfigError[] = [];
  private warnings: ConfigWarning[] = [];
  private recommendations: ConfigRecommendation[] = [];

  constructor(
    config: Partial<AppConfig> = {},
    environment: EnvironmentConfig,
    secrets: SecretValidationResult
  ) {
    this.config = config;
    this.environment = environment;
    this.secrets = secrets;
  }

  /**
   * Validate complete configuration
   */
  validate(): ConfigValidationResult {
    this.errors = [];
    this.warnings = [];
    this.recommendations = [];

    // Validate core configuration
    this.validateCoreConfig();
    
    // Validate feature dependencies
    this.validateFeatureDependencies();
    
    // Validate performance configuration
    this.validatePerformanceConfig();
    
    // Validate security configuration
    this.validateSecurityConfig();
    
    // Validate integration readiness
    this.validateIntegrationReadiness();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Calculate readiness
    const readiness = this.calculateDeploymentReadiness();
    
    // Calculate overall score
    const score = this.calculateConfigScore();

    return {
      isValid: this.errors.length === 0,
      score,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.recommendations,
      readiness
    };
  }

  /**
   * Validate core configuration
   */
  private validateCoreConfig(): void {
    // Validate app name
    if (!this.config.appName || this.config.appName.trim() === '') {
      this.errors.push({
        category: 'core',
        field: 'appName',
        message: 'App name is required',
        severity: 'error',
        suggestion: 'Set a descriptive app name',
        impact: 'App identification and branding'
      });
    }

    // Validate version format
    if (this.config.version && !/^\d+\.\d+\.\d+$/.test(this.config.version)) {
      this.errors.push({
        category: 'core',
        field: 'version',
        message: 'Version must follow semantic versioning (x.y.z)',
        severity: 'error',
        suggestion: 'Use format like 1.0.0',
        impact: 'Version management and updates'
      });
    }

    // Validate environment
    const validEnvs = ['development', 'staging', 'production'];
    if (this.config.environment && !validEnvs.includes(this.config.environment)) {
      this.errors.push({
        category: 'core',
        field: 'environment',
        message: 'Invalid environment value',
        severity: 'error',
        suggestion: 'Use development, staging, or production',
        impact: 'Environment-specific configuration'
      });
    }
  }

  /**
   * Validate feature dependencies
   */
  private validateFeatureDependencies(): void {
    const features = this.config.features;
    if (!features) return;

    // AI Features validation
    if (features.ai?.enabled) {
      if (!this.environment.EXPO_PUBLIC_DEEPSEEK_API_KEY) {
        this.errors.push({
          category: 'features',
          field: 'ai.enabled',
          message: 'AI features enabled but DeepSeek API key not configured',
          severity: 'error',
          suggestion: 'Configure DeepSeek API key or disable AI features',
          impact: 'AI features will not function'
        });
      }

      if (features.ai.mlAgent && !features.ai.enabled) {
        this.warnings.push({
          category: 'features',
          field: 'ai.mlAgent',
          message: 'ML Agent enabled but AI features are disabled',
          suggestion: 'Enable AI features or disable ML Agent',
          impact: 'ML Agent requires AI features to function'
        });
      }
    }

    // Authentication validation
    if (features.auth?.enabled) {
      if (!this.environment.EXPO_PUBLIC_SUPABASE_URL) {
        this.errors.push({
          category: 'features',
          field: 'auth.enabled',
          message: 'Authentication enabled but Supabase not configured',
          severity: 'critical',
          suggestion: 'Configure Supabase or disable authentication',
          impact: 'User authentication will not work'
        });
      }

      if (features.auth.google && !this.environment.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
        this.warnings.push({
          category: 'features',
          field: 'auth.google',
          message: 'Google authentication enabled but client ID not configured',
          suggestion: 'Configure Google OAuth or disable Google auth',
          impact: 'Google sign-in will not work'
        });
      }
    }

    // Analysis features validation
    if (features.analysis?.enabled) {
      if (!this.environment.EXPO_PUBLIC_SUPABASE_URL) {
        this.errors.push({
          category: 'features',
          field: 'analysis.enabled',
          message: 'Analysis features enabled but Supabase not configured',
          severity: 'error',
          suggestion: 'Configure Supabase or disable analysis features',
          impact: 'Analysis sessions will not be saved'
        });
      }
    }

    // Social features validation
    if (features.social?.comments) {
      if (!this.environment.EXPO_PUBLIC_SUPABASE_URL) {
        this.warnings.push({
          category: 'features',
          field: 'social.comments',
          message: 'Comments enabled but Supabase not configured',
          suggestion: 'Configure Supabase for comment storage',
          impact: 'Comments will not be persisted'
        });
      }
    }
  }

  /**
   * Validate performance configuration
   */
  private validatePerformanceConfig(): void {
    const performance = this.config.performance;
    if (!performance) return;

    // Cache configuration
    if (performance.cache?.enabled) {
      if (!performance.cache.ttl || performance.cache.ttl < 60) {
        this.warnings.push({
          category: 'performance',
          field: 'cache.ttl',
          message: 'Cache TTL is too short',
          suggestion: 'Use at least 60 seconds for cache TTL',
          impact: 'Frequent cache misses will impact performance'
        });
      }

      if (!performance.cache.maxSize || performance.cache.maxSize < 100) {
        this.warnings.push({
          category: 'performance',
          field: 'cache.maxSize',
          message: 'Cache max size is too small',
          suggestion: 'Use at least 100 items for cache size',
          impact: 'Small cache may not provide performance benefits'
        });
      }
    }

    // Rate limiting configuration
    if (performance.rateLimit?.enabled) {
      if (!performance.rateLimit.requests || performance.rateLimit.requests < 1) {
        this.errors.push({
          category: 'performance',
          field: 'rateLimit.requests',
          message: 'Rate limit requests must be at least 1',
          severity: 'error',
          suggestion: 'Set a reasonable rate limit (e.g., 100 requests)',
          impact: 'Invalid rate limiting configuration'
        });
      }

      if (!performance.rateLimit.window || performance.rateLimit.window < 1000) {
        this.errors.push({
          category: 'performance',
          field: 'rateLimit.window',
          message: 'Rate limit window must be at least 1000ms',
          severity: 'error',
          suggestion: 'Use at least 1 second for rate limit window',
          impact: 'Invalid rate limiting configuration'
        });
      }
    }
  }

  /**
   * Validate security configuration
   */
  private validateSecurityConfig(): void {
    const security = this.config.security;
    if (!security) return;

    // Encryption configuration
    if (security.encryption?.enabled) {
      if (!this.environment.ENCRYPTION_KEY) {
        this.warnings.push({
          category: 'security',
          field: 'encryption.enabled',
          message: 'Encryption enabled but encryption key not configured',
          suggestion: 'Configure ENCRYPTION_KEY for data encryption',
          impact: 'Data encryption will not work without key'
        });
      }
    }

    // Authentication security
    if (security.authentication?.jwtExpiry) {
      if (security.authentication.jwtExpiry < 300) {
        this.warnings.push({
          category: 'security',
          field: 'authentication.jwtExpiry',
          message: 'JWT expiry is too short',
          suggestion: 'Use at least 5 minutes (300 seconds) for JWT expiry',
          impact: 'Short JWT expiry may cause frequent re-authentication'
        });
      }

      if (security.authentication.jwtExpiry > 86400) {
        this.warnings.push({
          category: 'security',
          field: 'authentication.jwtExpiry',
          message: 'JWT expiry is too long',
          suggestion: 'Use at most 24 hours (86400 seconds) for JWT expiry',
          impact: 'Long JWT expiry increases security risk'
        });
      }
    }

    // Data protection
    if (security.dataProtection?.rls && !this.environment.EXPO_PUBLIC_SUPABASE_URL) {
      this.warnings.push({
        category: 'security',
        field: 'dataProtection.rls',
        message: 'Row Level Security enabled but Supabase not configured',
        suggestion: 'Configure Supabase for RLS implementation',
        impact: 'RLS policies will not be enforced'
      });
    }
  }

  /**
   * Validate integration readiness
   */
  private validateIntegrationReadiness(): void {
    // Check Supabase integration
    if (this.environment.EXPO_PUBLIC_SUPABASE_URL && this.environment.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      // Supabase is configured
    } else {
      this.errors.push({
        category: 'integration',
        field: 'supabase',
        message: 'Supabase integration not configured',
        severity: 'critical',
        suggestion: 'Configure Supabase URL and anon key',
        impact: 'Core app functionality will not work'
      });
    }

    // Check AI integration
    if (this.config.features?.ai?.enabled && !this.environment.EXPO_PUBLIC_DEEPSEEK_API_KEY) {
      this.errors.push({
        category: 'integration',
        field: 'ai',
        message: 'AI integration not configured',
        severity: 'error',
        suggestion: 'Configure DeepSeek API key or disable AI features',
        impact: 'AI features will not function'
      });
    }

    // Check secrets validation
    if (!this.secrets.isValid) {
      this.errors.push({
        category: 'integration',
        field: 'secrets',
        message: 'Secrets validation failed',
        severity: 'critical',
        suggestion: 'Fix secret configuration issues',
        impact: 'Security vulnerabilities detected'
      });
    }
  }

  /**
   * Generate configuration recommendations
   */
  private generateRecommendations(): void {
    // Performance recommendations
    if (!this.config.performance?.cache?.enabled) {
      this.recommendations.push({
        category: 'performance',
        field: 'cache',
        recommendation: 'Enable caching for better performance',
        priority: 'medium',
        benefit: 'Reduces database load and improves response times'
      });
    }

    if (!this.config.performance?.optimization?.compression) {
      this.recommendations.push({
        category: 'performance',
        field: 'compression',
        recommendation: 'Enable compression for web assets',
        priority: 'medium',
        benefit: 'Reduces bandwidth usage and improves load times'
      });
    }

    // Security recommendations
    if (!this.config.security?.encryption?.enabled) {
      this.recommendations.push({
        category: 'security',
        field: 'encryption',
        recommendation: 'Enable data encryption',
        priority: 'high',
        benefit: 'Protects sensitive data at rest'
      });
    }

    if (!this.config.security?.dataProtection?.audit) {
      this.recommendations.push({
        category: 'security',
        field: 'audit',
        recommendation: 'Enable audit logging',
        priority: 'medium',
        benefit: 'Provides security monitoring and compliance'
      });
    }

    // Feature recommendations
    if (this.config.features?.auth?.enabled && !this.config.features.auth.google) {
      this.recommendations.push({
        category: 'features',
        field: 'google_auth',
        recommendation: 'Enable Google authentication',
        priority: 'low',
        benefit: 'Improves user experience with social login'
      });
    }

    if (!this.config.features?.monitoring?.enabled) {
      this.recommendations.push({
        category: 'features',
        field: 'monitoring',
        recommendation: 'Enable application monitoring',
        priority: 'medium',
        benefit: 'Provides insights into app performance and usage'
      });
    }
  }

  /**
   * Calculate deployment readiness
   */
  private calculateDeploymentReadiness(): DeploymentReadiness {
    const issues: string[] = [];
    let score = 100;

    // Check critical errors
    const criticalErrors = this.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      issues.push(`${criticalErrors.length} critical configuration errors`);
      score -= criticalErrors.length * 20;
    }

    // Check integration readiness
    if (!this.environment.EXPO_PUBLIC_SUPABASE_URL) {
      issues.push('Supabase integration not configured');
      score -= 30;
    }

    if (this.config.features?.ai?.enabled && !this.environment.EXPO_PUBLIC_DEEPSEEK_API_KEY) {
      issues.push('AI integration not configured');
      score -= 20;
    }

    // Check secrets validation
    if (!this.secrets.isValid) {
      issues.push('Secrets validation failed');
      score -= 25;
    }

    // Determine readiness levels
    const production = score >= 80 && criticalErrors.length === 0;
    const staging = score >= 60 && this.errors.length === 0;
    const development = score >= 40;

    let overall: 'ready' | 'not_ready' | 'needs_attention';
    if (score >= 80 && criticalErrors.length === 0) {
      overall = 'ready';
    } else if (score >= 60) {
      overall = 'needs_attention';
    } else {
      overall = 'not_ready';
    }

    return {
      overall,
      production,
      staging,
      development,
      issues,
      score: Math.max(0, score)
    };
  }

  /**
   * Calculate overall configuration score
   */
  private calculateConfigScore(): number {
    let score = 100;

    // Deduct for errors
    for (const error of this.errors) {
      if (error.severity === 'critical') score -= 15;
      else if (error.severity === 'error') score -= 10;
    }

    // Deduct for warnings
    score -= this.warnings.length * 2;

    // Bonus for good practices
    if (this.config.performance?.cache?.enabled) score += 5;
    if (this.config.security?.encryption?.enabled) score += 5;
    if (this.config.features?.monitoring?.enabled) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get comprehensive configuration report
   */
  getConfigurationReport(): string {
    const result = this.validate();
    
    let report = '⚙️ Configuration Validation Report\n\n';
    report += `Configuration Score: ${result.score}/100\n`;
    report += `Deployment Readiness: ${result.readiness.overall.toUpperCase()}\n\n`;
    
    // Readiness summary
    report += '🚀 Deployment Readiness:\n';
    report += `  • Production: ${result.readiness.production ? '✅' : '❌'}\n`;
    report += `  • Staging: ${result.readiness.staging ? '✅' : '❌'}\n`;
    report += `  • Development: ${result.readiness.development ? '✅' : '❌'}\n\n`;
    
    if (result.readiness.issues.length > 0) {
      report += 'Issues to address:\n';
      result.readiness.issues.forEach(issue => {
        report += `  • ${issue}\n`;
      });
      report += '\n';
    }
    
    // Errors
    if (result.errors.length > 0) {
      report += '❌ Configuration Errors:\n';
      result.errors.forEach(error => {
        report += `  • [${error.category}] ${error.field}: ${error.message}\n`;
        report += `    💡 ${error.suggestion}\n\n`;
      });
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      report += '⚠️  Configuration Warnings:\n';
      result.warnings.forEach(warning => {
        report += `  • [${warning.category}] ${warning.field}: ${warning.message}\n`;
        report += `    💡 ${warning.suggestion}\n\n`;
      });
    }
    
    // Recommendations
    if (result.recommendations.length > 0) {
      report += '💡 Recommendations:\n';
      result.recommendations.forEach(rec => {
        const priority = rec.priority.toUpperCase();
        report += `  • [${priority}] ${rec.field}: ${rec.recommendation}\n`;
        report += `    🔧 ${rec.benefit}\n\n`;
      });
    }
    
    return report;
  }
}

// Export convenience functions
export function validateConfiguration(
  config: Partial<AppConfig> = {},
  environment: EnvironmentConfig,
  secrets: SecretValidationResult
): ConfigValidationResult {
  const validator = new ConfigValidator(config, environment, secrets);
  return validator.validate();
}

// Export for use in other modules
export { AppConfigSchema };
