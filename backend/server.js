require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { globalApiRateLimiter } = require('./middlewares/rateLimiter.middleware');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP Headers
app.use(helmet({
  contentSecurityPolicy: false, // Handled dynamically in production Nginx / CDN
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local dev
    }
  },
  credentials: true
}));

// Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Morgan HTTP Logger integration with Winston
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Global Rate Limiting
app.use('/api', globalApiRateLimiter);

// Swagger Interactive API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Version Telemetry Endpoint
app.get('/api/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: '1.0.0',
    name: 'Landmark Developers Employee Attendance Tracking System',
    environment: process.env.NODE_ENV || 'development',
    buildDate: '2026-07-25'
  });
});

// API Router
app.use('/api/v1', routes);
app.use('/api', routes);

// Centralized Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`📚 Swagger API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
