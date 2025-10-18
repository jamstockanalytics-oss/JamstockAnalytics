// validation.js
// Input validation utilities as specified in CONTEXT.md

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Stock symbol validation
 * @param {string} symbol - Stock symbol to validate
 * @returns {boolean} - True if valid stock symbol format
 */
export function validateStockSymbol(symbol) {
  if (!symbol) return false;
  
  // JSE stock symbols are typically 3-5 uppercase letters
  const symbolRegex = /^[A-Z]{3,5}$/;
  return symbolRegex.test(symbol.toUpperCase());
}

/**
 * News article validation
 * @param {object} article - Article object to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validateNewsArticle(article) {
  const errors = [];
  
  if (!article) {
    errors.push('Article is required');
    return { isValid: false, errors };
  }
  
  if (!article.title || article.title.trim().length === 0) {
    errors.push('Article title is required');
  }
  
  if (!article.summary || article.summary.trim().length === 0) {
    errors.push('Article summary is required');
  }
  
  if (!article.source || article.source.trim().length === 0) {
    errors.push('Article source is required');
  }
  
  if (!article.publishedAt || !(article.publishedAt instanceof Date)) {
    errors.push('Valid publication date is required');
  }
  
  if (article.sentiment && !['positive', 'neutral', 'negative'].includes(article.sentiment)) {
    errors.push('Sentiment must be positive, neutral, or negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * User input validation
 * @param {object} userData - User data to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validateUserInput(userData) {
  const errors = [];
  
  if (!userData) {
    errors.push('User data is required');
    return { isValid: false, errors };
  }
  
  // Validate email
  if (userData.email && !validateEmail(userData.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate password
  if (userData.password) {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  // Validate name fields
  if (userData.firstName && userData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (userData.lastName && userData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * API request validation
 * @param {object} request - API request to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validateApiRequest(request) {
  const errors = [];
  
  if (!request) {
    errors.push('Request is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!request.method) {
    errors.push('Request method is required');
  }
  
  if (!request.url) {
    errors.push('Request URL is required');
  }
  
  // Validate method
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (request.method && !validMethods.includes(request.method.toUpperCase())) {
    errors.push('Invalid request method');
  }
  
  // Validate URL format
  if (request.url && !request.url.startsWith('/')) {
    errors.push('Request URL must start with /');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Market data validation
 * @param {object} marketData - Market data to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validateMarketData(marketData) {
  const errors = [];
  
  if (!marketData) {
    errors.push('Market data is required');
    return { isValid: false, errors };
  }
  
  // Validate symbol
  if (!marketData.symbol || !validateStockSymbol(marketData.symbol)) {
    errors.push('Valid stock symbol is required');
  }
  
  // Validate price
  if (marketData.currentPrice && (isNaN(marketData.currentPrice) || marketData.currentPrice <= 0)) {
    errors.push('Current price must be a positive number');
  }
  
  // Validate change percentage
  if (marketData.changePercentage && isNaN(marketData.changePercentage)) {
    errors.push('Change percentage must be a number');
  }
  
  // Validate volume
  if (marketData.volume && (isNaN(marketData.volume) || marketData.volume < 0)) {
    errors.push('Volume must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize all inputs
 * @param {object} data - Data object to validate and sanitize
 * @returns {object} - Processed data with validation results
 */
export function validateAndSanitize(data) {
  const processed = {};
  const errors = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      processed[key] = sanitizeInput(value);
    } else {
      processed[key] = value;
    }
  }
  
  return {
    data: processed,
    errors
  };
}

export default {
  validateEmail,
  validatePassword,
  validateStockSymbol,
  validateNewsArticle,
  validateUserInput,
  validateApiRequest,
  validateMarketData,
  sanitizeInput,
  validateAndSanitize
};
