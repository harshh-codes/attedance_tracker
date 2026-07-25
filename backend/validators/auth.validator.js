/**
 * Validate login request input
 * @param {object} body 
 * @returns {object} { isValid: boolean, errors: object }
 */
const validateLoginInput = (body) => {
  const errors = {};
  const email = body.email ? body.email.trim() : '';
  const password = body.password ? body.password : '';

  // Email validations
  if (!email) {
    errors.email = 'Email address is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
  }

  // Password validations
  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

module.exports = {
  validateLoginInput
};
