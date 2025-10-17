# JamStockAnalytics Validation System

## Overview

The JamStockAnalytics validation system provides comprehensive validation for environment variables, secrets, configuration, and deployment readiness. This system replaces the old `validate-secrets.js` with enhanced functionality while maintaining backward compatibility.

## Features

### 🔍 Comprehensive Validation
- **Environment Variables**: Type-safe validation with pattern matching
- **Secrets Security**: Advanced security validation with entropy analysis
- **Configuration**: Feature dependency and consistency validation
- **Integration**: Service integration and connectivity validation
- **Deployment Readiness**: Production readiness assessment

### 🛡️ Security Features
- **Pattern Matching**: Validates JWT tokens, API keys, URLs, and more
- **Entropy Analysis**: Checks password and encryption key strength
- **Placeholder Detection**: Identifies placeholder and test values
- **Security Scoring**: Provides security score (0-100) with recommendations
- **Audit Trail**: Comprehensive logging and reporting

### ⚡ Performance Features
- **TypeScript Support**: Full type safety and IntelliSense
- **Async Validation**: Non-blocking validation for large configurations
- **Caching**: Intelligent caching for repeated validations
- **Parallel Processing**: Concurrent validation for better performance
- **Memory Efficient**: Optimized for large-scale deployments

## Quick Start

### Basic Usage

```bash
# Run comprehensive validation
npm run validate-all

# Run specific validation types
npm run validate-env
npm run validate-secrets-advanced
npm run validate-config

# Run legacy validation (backward compatibility)
npm run validate-secrets
```

### Programmatic Usage

```typescript
import { validateJamStockAnalytics, validateEnvironment, validateSecrets } from './lib/validation';

// Comprehensive validation
const results = await validateJamStockAnalytics({
  verbose: true
});

// Environment only
const envResults = validateEnvironment();

// Secrets only
const secretsResults = validateSecrets();
```

## Validation Types

### 1. Environment Validation

Validates all environment variables with type safety and pattern matching.

```typescript
import { validateEnvironment } from './lib/validation';

const result = validateEnvironment();
console.log(result.isValid); // boolean
console.log(result.errors);  // ValidationError[]
console.log(result.warnings); // ValidationWarning[]
```

**Validates:**
- Supabase configuration (URL, keys)
- AI service configuration (DeepSeek API)
- App configuration (NODE_ENV, PORT)
- Security configuration (JWT_SECRET, ENCRYPTION_KEY)
- Performance configuration (rate limits, caching)
- Feature flags (AI, auth, analysis, social)

### 2. Secrets Validation

Advanced security validation with entropy analysis and security scoring.

```typescript
import { validateSecrets } from './lib/validation';

const result = validateSecrets();
console.log(result.isValid);     // boolean
console.log(result.score);       // number (0-100)
console.log(result.errors);      // SecretError[]
console.log(result.warnings);    // SecretWarning[]
console.log(result.recommendations); // SecretRecommendation[]
```

**Security Checks:**
- JWT token format validation
- API key format validation
- URL format validation
- Entropy analysis for encryption keys
- Placeholder detection
- Duplicate secret detection
- Weak value detection

### 3. Configuration Validation

Validates application configuration and feature dependencies.

```typescript
import { validateConfiguration } from './lib/validation';

const result = validateConfiguration(config, environment, secrets);
console.log(result.isValid);     // boolean
console.log(result.score);       // number (0-100)
console.log(result.readiness);   // DeploymentReadiness
```

**Validates:**
- Feature dependencies
- Performance configuration
- Security configuration
- Integration readiness
- Deployment readiness

## Configuration Schema

### Environment Schema

```typescript
const EnvironmentSchema = z.object({
  // Supabase Configuration
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().regex(/^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(100).regex(/^eyJ[A-Za-z0-9+/=]+$/),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100).regex(/^eyJ[A-Za-z0-9+/=]+$/),
  
  // AI Service Configuration
  EXPO_PUBLIC_DEEPSEEK_API_KEY: z.string().min(20).regex(/^sk-[a-zA-Z0-9]+$/),
  
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().min(1000).max(65535),
  
  // Security Configuration
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.coerce.boolean().default(true),
  ENABLE_ML_AGENT: z.coerce.boolean().default(true),
  ENABLE_FALLBACK_RESPONSES: z.coerce.boolean().default(true),
  ENABLE_USER_BLOCKING: z.coerce.boolean().default(true),
  ENABLE_COMMENTS: z.coerce.boolean().default(true),
  ENABLE_ANALYSIS_MODE: z.coerce.boolean().default(true)
});
```

### Secrets Configuration

```typescript
const SecretConfigurations = {
  'EXPO_PUBLIC_SUPABASE_URL': {
    type: 'url',
    required: true,
    pattern: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/,
    securityLevel: 'medium'
  },
  'EXPO_PUBLIC_SUPABASE_ANON_KEY': {
    type: 'jwt',
    required: true,
    minLength: 100,
    pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
    securityLevel: 'high'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    type: 'jwt',
    required: true,
    minLength: 100,
    pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
    securityLevel: 'critical'
  },
  'EXPO_PUBLIC_DEEPSEEK_API_KEY': {
    type: 'api_key',
    required: true,
    minLength: 20,
    pattern: /^sk-[a-zA-Z0-9]{20,}$/,
    securityLevel: 'high'
  }
};
```

## Security Features

### Pattern Matching

The system validates various secret types with specific patterns:

- **JWT Tokens**: `^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$`
- **API Keys**: `^sk-[a-zA-Z0-9]{20,}$`
- **URLs**: `^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$`
- **UUIDs**: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`

### Entropy Analysis

For encryption keys and passwords, the system calculates entropy:

```typescript
function calculateEntropy(str: string): number {
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
```

### Security Scoring

The system provides a security score (0-100) based on:

- **Secret Strength**: Length, entropy, format validation
- **Configuration Security**: Encryption, authentication, data protection
- **Integration Security**: Service configuration, API keys
- **Best Practices**: HTTPS usage, secure defaults

## Deployment Readiness

### Readiness Levels

- **Ready**: Score ≥ 80, no critical errors
- **Needs Attention**: Score ≥ 60, some warnings
- **Not Ready**: Score < 60, critical errors

### Readiness Assessment

```typescript
interface DeploymentReadiness {
  overall: 'ready' | 'not_ready' | 'needs_attention';
  production: boolean;
  staging: boolean;
  development: boolean;
  issues: string[];
  score: number;
}
```

## Error Handling

### Error Types

```typescript
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
```

### Error Categories

- **Critical**: Prevents deployment (missing required secrets)
- **Error**: Configuration issues (invalid format, too short)
- **Warning**: Recommendations (optional features, best practices)

## Reporting

### Comprehensive Report

```typescript
const validator = new JamStockAnalyticsValidator();
const report = validator.getComprehensiveReport();
console.log(report);
```

### Security Report

```typescript
const secretsValidator = new SecretsValidator();
const report = secretsValidator.getSecurityReport();
console.log(report);
```

### Configuration Report

```typescript
const configValidator = new ConfigValidator();
const report = configValidator.getConfigurationReport();
console.log(report);
```

## CLI Usage

### Available Commands

```bash
# Comprehensive validation
npm run validate-all

# Individual validations
npm run validate-env
npm run validate-secrets-advanced
npm run validate-config

# Legacy compatibility
npm run validate-secrets

# Enhanced validation with options
npm run validate-comprehensive
```

### Command Options

```bash
# Use legacy validation
npm run validate-secrets -- --legacy

# Use enhanced validation
npm run validate-secrets -- --enhanced

# Verbose output
npm run validate-all -- --verbose
```

## Integration

### CI/CD Integration

```yaml
# GitHub Actions
- name: Validate Configuration
  run: npm run validate-all

# Exit code 0: Success
# Exit code 1: Validation failed
```

### Monitoring Integration

```typescript
import { JamStockAnalyticsValidator } from './lib/validation';

const validator = new JamStockAnalyticsValidator();
const status = validator.getStatus();

// Use in health checks
if (!status.healthy) {
  // Alert or take action
}
```

## Migration from Legacy

### Backward Compatibility

The new system maintains backward compatibility with the old `validate-secrets.js`:

```bash
# Old command still works
npm run validate-secrets

# New enhanced command
npm run validate-all
```

### Migration Steps

1. **Install new validation system** (already included)
2. **Update scripts** to use new commands
3. **Test validation** with existing configuration
4. **Update CI/CD** to use new validation commands
5. **Remove old scripts** when ready

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all dependencies are installed
2. **Module Not Found**: Check import paths and file structure
3. **Validation Failures**: Review error messages and suggestions
4. **Performance Issues**: Use async validation for large configurations

### Debug Mode

```bash
# Enable debug logging
DEBUG=validation npm run validate-all

# Verbose output
npm run validate-all -- --verbose
```

## Contributing

### Adding New Validators

1. Create validator class in `lib/validation/`
2. Add to main index file
3. Update documentation
4. Add tests

### Custom Validation Rules

```typescript
// Add custom validation
const customSchema = z.object({
  CUSTOM_VAR: z.string().min(10).regex(/^custom-/)
});
```

## Support

For issues or questions:

1. Check the error messages and suggestions
2. Review the comprehensive report
3. Check the troubleshooting section
4. Create an issue with validation output

## License

This validation system is part of JamStockAnalytics and follows the same license terms.
