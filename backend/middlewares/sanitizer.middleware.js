/**
 * Basic Input Sanitizer Middleware to strip dangerous HTML tags and XSS attack patterns
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '');
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

const inputSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = { inputSanitizer };
