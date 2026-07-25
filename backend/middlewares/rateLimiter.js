const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Login Endpoint
 * Prevents brute force login attacks by limiting requests per IP window.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 login requests per window
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

module.exports = {
  loginRateLimiter
};
