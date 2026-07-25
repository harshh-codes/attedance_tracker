const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password using bcryptjs
 * @param {string} password 
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password against a hashed password
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>} True if match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
