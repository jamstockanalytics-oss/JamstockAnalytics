/**
 * Environment Validation Package
 * Comprehensive validation for all environment variables and secrets
 * 
 * Features:
 * - Type-safe environment validation
 * - Security pattern matching
 * - Comprehensive error reporting
 * - Development vs production validation
 * - Integration with all app services
 */

import { z } from 'zod';

// Environment validation schemas
export const EnvironmentSchema = z.object({
  // Supabase Configuration
  EXPO_PUBLIC_SUPABASE_URL: z.string()
    .url('Must be a valid Supabase URL')
    .regex(/^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/, 'Must be a valid Supabase project URL'),
  
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string()
    .min(100, 'Supabase anon key must be at least 100 characters')
    .regex(/^eyJ[A-Za-z0-9+/=]+$/, 'Must be a valid JWT token'),
  
  SUPABASE_SERVICE_ROLE_KEY: z.string()
    .min(100, 'Service role key must be at least 100 characters')
    .regex(/^eyJ[A-Za-z0-9+/=]+$/, 'Must be a valid JWT token'),
  
  // AI Service Configuration
  EXPO_PUBLIC_DEEPSEEK_API_KEY: z.string()
    .min(20, 'DeepSeek API key must be at least 20 characters')
    .regex(/^sk-[a-zA-Z0-9]+$/, 'Must be a valid DeepSeek API key format'),
  
  // Optional AI Configuration
  DEEPSEEK_API_URL: z.string().url().optional().default('https://api.deepseek.com/v1/chat/completions'),
  DEEPSEEK_MODEL: z.string().optional().default('deepseek-chat'),
  DEEPSEEK_TEMPERATURE: z.coerce.number().min(0).max(2).optional().default(0.7),
  
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1000).max(65535).optional().default(8000),
  
  // Security Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters').optional(),
  
  // Rate Limiting
  RATE_LIMIT: z.coerce.number().min(1).max(10000).optional().default(100),
  WINDOW_MS: z.coerce.number().min(1000).max(3600000).optional().default(60000),
  MAX_MESSAGES: z.coerce.number().min(1).max(1000).optional().default(100),
  CLEANUP_DAYS: z.coerce.number().min(1).max(365).optional().default(30),
  
  // Database Configuration
  SUPABASE_DB_URL: z.string().url().optional(),
  
  // Development Configuration
  EXPO_TOKEN: z.string().optional(),
  GCP_SA_KEY: z.string().optional(),
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.coerce.boolean().optional().default(true),
  ENABLE_ML_AGENT: z.coerce.boolean().optional().default(true),
  ENABLE_FALLBACK_RESPONSES: z.coerce.boolean().optional().default(true),
  ENABLE_USER_BLOCKING: z.coerce.boolean().optional().default(true),
  ENABLE_COMMENTS: z.coerce.boolean().optional().default(true),
  ENABLE_ANALYSIS_MODE: z.coerce.boolean().optional().default(true),
  
  // Performance Configuration
  CACHE_TTL: z.coerce.number().min(60).max(86400).optional().default(3600),
  MAX_CONCURRENT_REQUESTS: z.coerce.number().min(1).max(100).optional().default(10),
  REQUEST_TIMEOUT: z.coerce.number().min(1000).max(30000).optional().default(10000),
  
  // Monitoring Configuration
  ENABLE_MONITORING: z.coerce.boolean().optional().default(true),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  ENABLE_ANALYTICS: z.coerce.boolean().optional().default(true),
});

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  config?: EnvironmentConfig;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Security patterns for validation
export const SecurityPatterns = {
  // JWT token pattern
  JWT_TOKEN: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
  
  // API key patterns
  DEEPSEEK_API_KEY: /^sk-[a-zA-Z0-9]{20,}$/,
  OPENAI_API_KEY: /^sk-[a-zA-Z0-9]{20,}$/,
  
  // URL patterns
  SUPABASE_URL: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/,
  HTTPS_URL: /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/,
  
  // Password patterns
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Email patterns
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // UUID patterns
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// Placeholder detection patterns
export const PlaceholderPatterns = [
  /your[_-]?[a-zA-Z0-9_-]+/gi,
  /placeholder/gi,
  /example/gi,
  /test[_-]?[a-zA-Z0-9_-]+/gi,
  /demo/gi,
  /sample/gi,
  /dummy/gi,
  /fake/gi,
  /mock/gi,
];

export class EnvironmentValidator {
  private config: Partial<EnvironmentConfig> = {};
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(env: Record<string, string | undefined> = process.env) {
    this.config = this.parseEnvironment(env);
  }

  /**
   * Parse environment variables with type coercion
   */
  private parseEnvironment(env: Record<string, string | undefined>): Partial<EnvironmentConfig> {
    const config: any = {};
    
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) continue;
      
      // Handle boolean values
      if (value.toLowerCase() === 'true') config[key] = true;
      else if (value.toLowerCase() === 'false') config[key] = false;
      // Handle numeric values
      else if (!isNaN(Number(value))) config[key] = Number(value);
      // Handle string values
      else config[key] = value;
    }
    
    return config;
  }

  /**
   * Validate all environment variables
   */
  validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];

    try {
      // Validate using Zod schema
      const validatedConfig = EnvironmentSchema.parse(this.config);
      
      // Additional security checks
      this.performSecurityChecks(validatedConfig);
      
      // Check for placeholder values
      this.checkForPlaceholders();
      
      // Validate feature dependencies
      this.validateFeatureDependencies(validatedConfig);
      
      return {
        isValid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        config: validatedConfig
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          severity: 'error' as const,
          suggestion: this.getSuggestion(err.path.join('.'))
        }));
      } else {
        this.errors.push({
          field: 'unknown',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical' as const
        });
      }
      
      return {
        isValid: false,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Perform additional security checks
   */
  private performSecurityChecks(config: EnvironmentConfig): void {
    // Check JWT token format
    if (config.EXPO_PUBLIC_SUPABASE_ANON_KEY && !SecurityPatterns.JWT_TOKEN.test(config.EXPO_PUBLIC_SUPABASE_ANON_KEY)) {
      this.errors.push({
        field: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
        message: 'Invalid JWT token format',
        severity: 'error',
        suggestion: 'Ensure the key is a valid JWT token from Supabase'
      });
    }

    if (config.SUPABASE_SERVICE_ROLE_KEY && !SecurityPatterns.JWT_TOKEN.test(config.SUPABASE_SERVICE_ROLE_KEY)) {
      this.errors.push({
        field: 'SUPABASE_SERVICE_ROLE_KEY',
        message: 'Invalid JWT token format',
        severity: 'error',
        suggestion: 'Ensure the key is a valid JWT token from Supabase'
      });
    }

    // Check API key format
    if (config.EXPO_PUBLIC_DEEPSEEK_API_KEY && !SecurityPatterns.DEEPSEEK_API_KEY.test(config.EXPO_PUBLIC_DEEPSEEK_API_KEY)) {
      this.errors.push({
        field: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
        message: 'Invalid DeepSeek API key format',
        severity: 'error',
        suggestion: 'Ensure the key starts with "sk-" and is at least 20 characters'
      });
    }

    // Check URL format
    if (config.EXPO_PUBLIC_SUPABASE_URL && !SecurityPatterns.SUPABASE_URL.test(config.EXPO_PUBLIC_SUPABASE_URL)) {
      this.errors.push({
        field: 'EXPO_PUBLIC_SUPABASE_URL',
        message: 'Invalid Supabase URL format',
        severity: 'error',
        suggestion: 'Ensure the URL follows the pattern: https://your-project.supabase.co'
      });
    }
  }

  /**
   * Check for placeholder values
   */
  private checkForPlaceholders(): void {
    for (const [key, value] of Object.entries(this.config)) {
      if (typeof value === 'string') {
        for (const pattern of PlaceholderPatterns) {
          if (pattern.test(value)) {
            this.warnings.push({
              field: key,
              message: 'Contains placeholder text',
              suggestion: 'Replace with actual configuration value'
            });
          }
        }
      }
    }
  }

  /**
   * Validate feature dependencies
   */
  private validateFeatureDependencies(config: EnvironmentConfig): void {
    // AI features require DeepSeek API key
    if (config.ENABLE_AI_FEATURES && !config.EXPO_PUBLIC_DEEPSEEK_API_KEY) {
      this.warnings.push({
        field: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
        message: 'AI features enabled but DeepSeek API key not configured',
        suggestion: 'Configure DeepSeek API key or disable AI features'
      });
    }

    // ML Agent requires AI features
    if (config.ENABLE_ML_AGENT && !config.ENABLE_AI_FEATURES) {
      this.warnings.push({
        field: 'ENABLE_ML_AGENT',
        message: 'ML Agent enabled but AI features are disabled',
        suggestion: 'Enable AI features or disable ML Agent'
      });
    }

    // Analysis mode requires Supabase
    if (config.ENABLE_ANALYSIS_MODE && !config.EXPO_PUBLIC_SUPABASE_URL) {
      this.warnings.push({
        field: 'ENABLE_ANALYSIS_MODE',
        message: 'Analysis mode enabled but Supabase not configured',
        suggestion: 'Configure Supabase or disable analysis mode'
      });
    }
  }

  /**
   * Get suggestion for a field
   */
  private getSuggestion(field: string): string {
    const suggestions: Record<string, string> = {
      'EXPO_PUBLIC_SUPABASE_URL': 'Get your Supabase URL from the project settings',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY': 'Get your anon key from Supabase project settings',
      'SUPABASE_SERVICE_ROLE_KEY': 'Get your service role key from Supabase project settings',
      'EXPO_PUBLIC_DEEPSEEK_API_KEY': 'Get your API key from DeepSeek platform',
      'JWT_SECRET': 'Generate a secure random string for JWT signing',
      'ENCRYPTION_KEY': 'Generate a secure random string for data encryption'
    };
    
    return suggestions[field] || 'Check the documentation for proper configuration';
  }

  /**
   * Get validation summary
   */
  getSummary(): string {
    const result = this.validate();
    
    if (result.isValid) {
      return `✅ Environment validation passed (${result.warnings.length} warnings)`;
    } else {
      return `❌ Environment validation failed (${result.errors.length} errors, ${result.warnings.length} warnings)`;
    }
  }

  /**
   * Get detailed validation report
   */
  getDetailedReport(): string {
    const result = this.validate();
    let report = '🔍 Environment Validation Report\n\n';
    
    if (result.errors.length > 0) {
      report += '❌ Errors:\n';
      result.errors.forEach(error => {
        report += `  • ${error.field}: ${error.message}\n`;
        if (error.suggestion) {
          report += `    💡 ${error.suggestion}\n`;
        }
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += '⚠️  Warnings:\n';
      result.warnings.forEach(warning => {
        report += `  • ${warning.field}: ${warning.message}\n`;
        if (warning.suggestion) {
          report += `    💡 ${warning.suggestion}\n`;
        }
      });
      report += '\n';
    }
    
    if (result.isValid) {
      report += '✅ All required environment variables are properly configured!\n';
    } else {
      report += '❌ Please fix the errors above before proceeding.\n';
    }
    
    return report;
  }
}

// Export convenience functions
export function validateEnvironment(env: Record<string, string | undefined> = process.env): ValidationResult {
  const validator = new EnvironmentValidator(env);
  return validator.validate();
}

export function getEnvironmentConfig(env: Record<string, string | undefined> = process.env): EnvironmentConfig {
  const validator = new EnvironmentValidator(env);
  const result = validator.validate();
  
  if (!result.isValid) {
    throw new Error(`Environment validation failed: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  return result.config!;
}

// Export for use in other modules
export { EnvironmentSchema, SecurityPatterns, PlaceholderPatterns };
