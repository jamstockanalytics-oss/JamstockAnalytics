// error-handler.js
// Comprehensive error handling for JamStockAnalytics web application

/**
 * Error types and codes
 */
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  MARKET_DATA_ERROR: 'MARKET_DATA_ERROR',
  NEWS_SERVICE_ERROR: 'NEWS_SERVICE_ERROR',
  WEBHOOK_ERROR: 'WEBHOOK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, severity = ERROR_SEVERITY.MEDIUM, code = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.stack = new Error().stack;
  }
}

/**
 * Error logging service
 */
export class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000; // Keep last 1000 errors in memory
  }

  log(error, context = {}) {
    const errorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
      severity: error.severity || ERROR_SEVERITY.MEDIUM,
      code: error.code,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.push(errorLog);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorLog);
    }
  }

  generateErrorId() {
    return 'ERR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async sendToLoggingService(errorLog) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      });
    } catch (err) {
      console.error('Failed to send error to logging service:', err);
    }
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

/**
 * Global error handler
 */
export class GlobalErrorHandler {
  constructor() {
    this.logger = new ErrorLogger();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        ERROR_TYPES.UNKNOWN_ERROR,
        ERROR_SEVERITY.HIGH
      ), { type: 'unhandledrejection', reason: event.reason });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(new AppError(
        event.message || 'JavaScript error',
        ERROR_TYPES.UNKNOWN_ERROR,
        ERROR_SEVERITY.MEDIUM
      ), { 
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle network errors
    this.setupNetworkErrorHandling();
  }

  setupNetworkErrorHandling() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const error = new AppError(
            `Network request failed: ${response.status} ${response.statusText}`,
            ERROR_TYPES.NETWORK_ERROR,
            ERROR_SEVERITY.MEDIUM,
            response.status
          );
          this.handleError(error, { url: args[0], status: response.status });
        }
        
        return response;
      } catch (err) {
        const error = new AppError(
          `Network request failed: ${err.message}`,
          ERROR_TYPES.NETWORK_ERROR,
          ERROR_SEVERITY.MEDIUM
        );
        this.handleError(error, { url: args[0], originalError: err });
        throw error;
      }
    };
  }

  handleError(error, context = {}) {
    // Log the error
    this.logger.log(error, context);

    // Handle different error types
    switch (error.type) {
      case ERROR_TYPES.VALIDATION_ERROR:
        this.handleValidationError(error);
        break;
      case ERROR_TYPES.AUTHENTICATION_ERROR:
        this.handleAuthenticationError(error);
        break;
      case ERROR_TYPES.NETWORK_ERROR:
        this.handleNetworkError(error);
        break;
      case ERROR_TYPES.SERVER_ERROR:
        this.handleServerError(error);
        break;
      default:
        this.handleGenericError(error);
    }
  }

  handleValidationError(error) {
    // Show user-friendly validation message
    this.showUserMessage('Please check your input and try again.', 'warning');
  }

  handleAuthenticationError(error) {
    // Redirect to login or show auth error
    this.showUserMessage('Please log in to continue.', 'error');
    // Optionally redirect to login page
    // window.location.href = '/login';
  }

  handleNetworkError(error) {
    // Show network error message
    this.showUserMessage('Network connection issue. Please check your internet connection.', 'error');
  }

  handleServerError(error) {
    // Show server error message
    this.showUserMessage('Server error. Please try again later.', 'error');
  }

  handleGenericError(error) {
    // Show generic error message
    this.showUserMessage('An unexpected error occurred. Please try again.', 'error');
  }

  showUserMessage(message, type = 'error') {
    // Create or update user notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

/**
 * API error handler
 */
export class ApiErrorHandler {
  static async handleApiError(response, context = {}) {
    let error;
    
    try {
      const errorData = await response.json();
      error = new AppError(
        errorData.message || 'API request failed',
        errorData.type || ERROR_TYPES.SERVER_ERROR,
        errorData.severity || ERROR_SEVERITY.MEDIUM,
        response.status
      );
    } catch (parseError) {
      error = new AppError(
        `API request failed: ${response.status} ${response.statusText}`,
        ERROR_TYPES.SERVER_ERROR,
        ERROR_SEVERITY.MEDIUM,
        response.status
      );
    }

    // Add context
    error.context = context;
    
    return error;
  }
}

/**
 * Service-specific error handlers
 */
export class ServiceErrorHandler {
  static handleMarketDataError(error, context = {}) {
    const appError = new AppError(
      `Market data error: ${error.message}`,
      ERROR_TYPES.MARKET_DATA_ERROR,
      ERROR_SEVERITY.MEDIUM
    );
    appError.context = { ...context, originalError: error };
    return appError;
  }

  static handleNewsServiceError(error, context = {}) {
    const appError = new AppError(
      `News service error: ${error.message}`,
      ERROR_TYPES.NEWS_SERVICE_ERROR,
      ERROR_SEVERITY.MEDIUM
    );
    appError.context = { ...context, originalError: error };
    return appError;
  }

  static handleAIServiceError(error, context = {}) {
    const appError = new AppError(
      `AI service error: ${error.message}`,
      ERROR_TYPES.AI_SERVICE_ERROR,
      ERROR_SEVERITY.HIGH
    );
    appError.context = { ...context, originalError: error };
    return appError;
  }

  static handleWebhookError(error, context = {}) {
    const appError = new AppError(
      `Webhook error: ${error.message}`,
      ERROR_TYPES.WEBHOOK_ERROR,
      ERROR_SEVERITY.MEDIUM
    );
    appError.context = { ...context, originalError: error };
    return appError;
  }
}

/**
 * Initialize global error handling
 */
export function initializeErrorHandling() {
  const globalHandler = new GlobalErrorHandler();
  return globalHandler;
}

/**
 * Utility functions
 */
export const ErrorUtils = {
  isNetworkError: (error) => error.type === ERROR_TYPES.NETWORK_ERROR,
  isValidationError: (error) => error.type === ERROR_TYPES.VALIDATION_ERROR,
  isServerError: (error) => error.type === ERROR_TYPES.SERVER_ERROR,
  isCriticalError: (error) => error.severity === ERROR_SEVERITY.CRITICAL,
  
  getErrorMessage: (error) => {
    if (error instanceof AppError) {
      return error.message;
    }
    return error.message || 'An unexpected error occurred';
  },
  
  getErrorType: (error) => {
    if (error instanceof AppError) {
      return error.type;
    }
    return ERROR_TYPES.UNKNOWN_ERROR;
  }
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  AppError,
  ErrorLogger,
  GlobalErrorHandler,
  ApiErrorHandler,
  ServiceErrorHandler,
  initializeErrorHandling,
  ErrorUtils
};
