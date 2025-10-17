/**
 * Security Configuration
 * Centralized security settings for the application
 */

export const SecurityConfig = {
  // API Configuration
  API_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Rate Limiting
  ENABLE_RATE_LIMITING: true,
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  
  // Input Validation
  MAX_INPUT_LENGTH: 10000,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILE_SIZE_MB: 10,
  
  // Authentication
  SESSION_TIMEOUT_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  
  // Content Security
  ALLOWED_DOMAINS: [
    'supabase.co',
    'deepseek.com',
    'localhost',
    '127.0.0.1'
  ],
  
  // Sanitization
  HTML_TAGS_ALLOWED: ['b', 'i', 'em', 'strong', 'p', 'br'],
  MAX_ARTICLES_PER_REQUEST: 50,
  MAX_COMMENTS_PER_ARTICLE: 100
};

export default SecurityConfig;