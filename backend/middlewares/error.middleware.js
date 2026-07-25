/**
 * Centralized Enterprise Production-Safe Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode < 400) statusCode = 500;

  let message = err.message || 'Internal Server Error';

  // Handle Prisma Database Error Codes
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this unique field already exists in the database.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested record was not found.';
  }

  // Handle JWT Error Codes
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired.';
  }

  const response = {
    success: false,
    message,
    statusCode
  };

  // Only include stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // Log error internally
  console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, message);

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
