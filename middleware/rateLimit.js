const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: {
    success: false,
    message: 'AI service rate limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = (req, res, next) => {
  // Apply different rate limits based on route
  if (req.path.startsWith('/api/auth')) {
    return authLimiter(req, res, next);
  } else if (req.path.startsWith('/api/ai')) {
    return aiLimiter(req, res, next);
  } else {
    return generalLimiter(req, res, next);
  }
};
