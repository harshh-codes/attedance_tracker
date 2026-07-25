/**
 * Validate punch-in GPS coordinates request payload
 */
const validatePunchInInput = (body) => {
  const errors = {};

  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = 'Valid latitude (-90 to 90) is required';
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = 'Valid longitude (-180 to 180) is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    latitude,
    longitude
  };
};

module.exports = {
  validatePunchInInput
};
