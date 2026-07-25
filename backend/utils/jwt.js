const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Sign JWT token with payload
 * @param {object} payload - Data payload (e.g. { userId, role })
 * @returns {string} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '1d'
  });
};

/**
 * Verify JWT Token
 * @param {string} token - JWT Token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken
};
