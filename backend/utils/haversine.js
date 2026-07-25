/**
 * Calculate distance in meters between two geographical points using the Haversine formula
 * @param {number} lat1 - Latitude of Point 1 (in degrees)
 * @param {number} lon1 - Longitude of Point 1 (in degrees)
 * @param {number} lat2 - Latitude of Point 2 (in degrees)
 * @param {number} lon2 - Longitude of Point 2 (in degrees)
 * @returns {number} Distance in meters
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's mean radius in meters
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

module.exports = {
  calculateHaversineDistance
};
