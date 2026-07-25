const rateLimit = require('express-rate-limit');

/**
 * Login Rate Limiter - Prevents Brute-Force Password Attacks
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed/successful login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.'
  }
});

/**
 * Attendance Punch-In Rate Limiter - Prevents Automated Script Spam
 */
const punchInRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 punch-in requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many punch-in attempts. Please wait a minute before trying again.'
  }
});

/**
 * Global API Rate Limiter
 */
const globalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Too many requests from this IP address.'
  }
});

/**
 * Forgot Password Rate Limiter - Prevents Email Spamming
 */
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 password reset requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP address. Please try again after 15 minutes.'
  }
});

module.exports = {
  loginRateLimiter,
  punchInRateLimiter,
  globalApiRateLimiter,
  forgotPasswordRateLimiter
};
