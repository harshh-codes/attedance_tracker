/**
 * Health Controller
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Landmark Developers Attendance API is operational',
    system: 'Landmark Developers Employee Attendance Tracking System',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealthStatus
};
