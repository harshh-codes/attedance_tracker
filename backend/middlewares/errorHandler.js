const config = require('../config/env');

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  };

  if (config.nodeEnv === 'development') {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
