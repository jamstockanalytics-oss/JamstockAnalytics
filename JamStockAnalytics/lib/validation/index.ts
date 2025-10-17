/**
 * Validation Package - Main Entry Point
 * Comprehensive validation system for JamStockAnalytics
 * 
 * This package provides:
 * - Environment variable validation
 * - Secrets and security validation
 * - Configuration validation
 * - Integration validation
 * - Deployment readiness assessment
 */

// Export all validation modules
export * from './environment-validator';
export * from './secrets-validator';
export * from './config-validator';

// Re-export types for convenience
export type {
  EnvironmentConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './environment-validator';

export type {
  SecretValidationResult,
  SecretError,
  SecretWarning,
  SecretRecommendation,
  SecretType
} from './secrets-validator';

export type {
  AppConfig,
  ConfigValidationResult,
  ConfigError,
  ConfigWarning,
  ConfigRecommendation,
  DeploymentReadiness
} from './config-validator';

// Main validation class that combines all validators
export class JamStockAnalyticsValidator {
  private environment: EnvironmentConfig | null = null;
  private secrets: SecretValidationResult | null = null;
  private config: ConfigValidationResult | null = null;

  /**
   * Run complete validation suite
   */
  async validateAll(options: {
    environment?: Record<string, string | undefined>;
    secrets?: Record<string, string | undefined>;
    config?: Partial<AppConfig>;
    verbose?: boolean;
  } = {}): Promise<{
    environment: ValidationResult;
    secrets: SecretValidationResult;
    config: ConfigValidationResult;
    overall: {
      isValid: boolean;
      score: number;
      readiness: 'ready' | 'not_ready' | 'needs_attention';
      summary: string;
    };
  }> {
    const { EnvironmentValidator } = await import('./environment-validator');
    const { SecretsValidator } = await import('./secrets-validator');
    const { ConfigValidator } = await import('./config-validator');

    // Validate environment
    const envValidator = new EnvironmentValidator(options.environment);
    const environment = envValidator.validate();
    this.environment = environment.config || undefined as any;

    // Validate secrets
    const secretsValidator = new SecretsValidator(options.secrets);
    const secrets = secretsValidator.validate();
    this.secrets = secrets;

    // Validate configuration
    const configValidator = new ConfigValidator(
      options.config || {},
      this.environment!,
      secrets
    );
    const config = configValidator.validate();
    this.config = config;

    // Calculate overall results
    const overall = this.calculateOverallResults(environment, secrets, config);

    if (options.verbose) {
      console.log(this.getComprehensiveReport());
    }

    return {
      environment,
      secrets,
      config,
      overall
    };
  }

  /**
   * Calculate overall validation results
   */
  private calculateOverallResults(
    environment: ValidationResult,
    secrets: SecretValidationResult,
    config: ConfigValidationResult
  ) {
    const isValid = environment.isValid && secrets.isValid && config.isValid;
    
    // Calculate weighted score
    const envWeight = 0.3;
    const secretsWeight = 0.4;
    const configWeight = 0.3;
    
    const score = Math.round(
      (environment.isValid ? 100 : 0) * envWeight +
      secrets.score * secretsWeight +
      config.score * configWeight
    );

    let readiness: 'ready' | 'not_ready' | 'needs_attention';
    if (score >= 80 && isValid) {
      readiness = 'ready';
    } else if (score >= 60) {
      readiness = 'needs_attention';
    } else {
      readiness = 'not_ready';
    }

    const summary = this.generateSummary(environment, secrets, config, score, readiness);

    return {
      isValid,
      score,
      readiness,
      summary
    };
  }

  /**
   * Generate validation summary
   */
  private generateSummary(
    environment: ValidationResult,
    secrets: SecretValidationResult,
    config: ConfigValidationResult,
    score: number,
    readiness: string
  ): string {
    const totalErrors = environment.errors.length + secrets.errors.length + config.errors.length;
    const totalWarnings = environment.warnings.length + secrets.warnings.length + config.warnings.length;

    let summary = `🔍 JamStockAnalytics Validation Summary\n\n`;
    summary += `Overall Score: ${score}/100\n`;
    summary += `Deployment Readiness: ${readiness.toUpperCase()}\n\n`;
    
    summary += `📊 Validation Results:\n`;
    summary += `  • Environment: ${environment.isValid ? '✅' : '❌'} (${environment.errors.length} errors, ${environment.warnings.length} warnings)\n`;
    summary += `  • Secrets: ${secrets.isValid ? '✅' : '❌'} (${secrets.score}/100 score)\n`;
    summary += `  • Configuration: ${config.isValid ? '✅' : '❌'} (${config.score}/100 score)\n\n`;

    if (totalErrors > 0) {
      summary += `❌ Critical Issues: ${totalErrors} errors need attention\n`;
    }
    
    if (totalWarnings > 0) {
      summary += `⚠️  Warnings: ${totalWarnings} warnings for review\n`;
    }

    if (readiness === 'ready') {
      summary += `\n✅ Ready for deployment!\n`;
    } else if (readiness === 'needs_attention') {
      summary += `\n⚠️  Needs attention before deployment\n`;
    } else {
      summary += `\n❌ Not ready for deployment\n`;
    }

    return summary;
  }

  /**
   * Get comprehensive validation report
   */
  getComprehensiveReport(): string {
    if (!this.environment || !this.secrets || !this.config) {
      return '❌ Validation not run yet. Call validateAll() first.';
    }

    let report = '🔍 JamStockAnalytics Comprehensive Validation Report\n';
    report += '=' .repeat(60) + '\n\n';

    // Environment section
    report += '🌍 ENVIRONMENT VALIDATION\n';
    report += '-'.repeat(30) + '\n';
    report += `Status: ${this.environment.isValid ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `Errors: ${this.environment.errors.length}\n`;
    report += `Warnings: ${this.environment.warnings.length}\n\n`;

    if (this.environment.errors.length > 0) {
      report += 'Environment Errors:\n';
      this.environment.errors.forEach(error => {
        report += `  • ${error.field}: ${error.message}\n`;
      });
      report += '\n';
    }

    // Secrets section
    report += '🔒 SECRETS VALIDATION\n';
    report += '-'.repeat(30) + '\n';
    report += `Status: ${this.secrets.isValid ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `Security Score: ${this.secrets.score}/100\n`;
    report += `Errors: ${this.secrets.errors.length}\n`;
    report += `Warnings: ${this.secrets.warnings.length}\n`;
    report += `Recommendations: ${this.secrets.recommendations.length}\n\n`;

    if (this.secrets.errors.length > 0) {
      report += 'Secrets Errors:\n';
      this.secrets.errors.forEach(error => {
        report += `  • ${error.field}: ${error.message}\n`;
      });
      report += '\n';
    }

    // Configuration section
    report += '⚙️ CONFIGURATION VALIDATION\n';
    report += '-'.repeat(30) + '\n';
    report += `Status: ${this.config.isValid ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `Configuration Score: ${this.config.score}/100\n`;
    report += `Deployment Readiness: ${this.config.readiness.overall.toUpperCase()}\n`;
    report += `Errors: ${this.config.errors.length}\n`;
    report += `Warnings: ${this.config.warnings.length}\n`;
    report += `Recommendations: ${this.config.recommendations.length}\n\n`;

    if (this.config.readiness.issues.length > 0) {
      report += 'Deployment Issues:\n';
      this.config.readiness.issues.forEach(issue => {
        report += `  • ${issue}\n`;
      });
      report += '\n';
    }

    // Recommendations section
    const allRecommendations = [
      ...this.secrets.recommendations,
      ...this.config.recommendations
    ];

    if (allRecommendations.length > 0) {
      report += '💡 RECOMMENDATIONS\n';
      report += '-'.repeat(30) + '\n';
      
      const byPriority = allRecommendations.reduce((acc, rec) => {
        if (!acc[rec.priority]) acc[rec.priority] = [];
        acc[rec.priority].push(rec);
        return acc;
      }, {} as Record<string, any[]>);

      ['critical', 'high', 'medium', 'low'].forEach(priority => {
        if (byPriority[priority]) {
          report += `\n${priority.toUpperCase()} Priority:\n`;
          byPriority[priority].forEach(rec => {
            report += `  • ${rec.field}: ${rec.recommendation || rec.suggestion}\n`;
          });
        }
      });
      report += '\n';
    }

    // Summary
    const totalErrors = this.environment.errors.length + this.secrets.errors.length + this.config.errors.length;
    const totalWarnings = this.environment.warnings.length + this.secrets.warnings.length + this.config.warnings.length;

    report += '📊 SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    report += `Total Errors: ${totalErrors}\n`;
    report += `Total Warnings: ${totalWarnings}\n`;
    report += `Total Recommendations: ${allRecommendations.length}\n\n`;

    if (totalErrors === 0 && this.config.readiness.overall === 'ready') {
      report += '✅ All validations passed! Ready for deployment.\n';
    } else if (totalErrors === 0) {
      report += '⚠️  Validations passed but deployment needs attention.\n';
    } else {
      report += '❌ Validation failed. Please fix errors before deployment.\n';
    }

    return report;
  }

  /**
   * Quick validation for CI/CD
   */
  async quickValidate(): Promise<boolean> {
    const results = await this.validateAll();
    return results.overall.isValid && results.overall.readiness !== 'not_ready';
  }

  /**
   * Get validation status for monitoring
   */
  getStatus(): {
    healthy: boolean;
    score: number;
    readiness: string;
    issues: number;
    lastChecked: Date;
  } {
    if (!this.environment || !this.secrets || !this.config) {
      return {
        healthy: false,
        score: 0,
        readiness: 'not_ready',
        issues: 0,
        lastChecked: new Date()
      };
    }

    const totalErrors = this.environment.errors.length + this.secrets.errors.length + this.config.errors.length;
    const score = Math.round((this.secrets.score + this.config.score) / 2);

    return {
      healthy: totalErrors === 0 && this.config.readiness.overall !== 'not_ready',
      score,
      readiness: this.config.readiness.overall,
      issues: totalErrors,
      lastChecked: new Date()
    };
  }
}

// Export convenience functions
export async function validateJamStockAnalytics(options?: {
  environment?: Record<string, string | undefined>;
  secrets?: Record<string, string | undefined>;
  config?: Partial<AppConfig>;
  verbose?: boolean;
}) {
  const validator = new JamStockAnalyticsValidator();
  return await validator.validateAll(options);
}

export async function quickValidate(): Promise<boolean> {
  const validator = new JamStockAnalyticsValidator();
  return await validator.quickValidate();
}

// Export the main validator class as default
export default JamStockAnalyticsValidator;
