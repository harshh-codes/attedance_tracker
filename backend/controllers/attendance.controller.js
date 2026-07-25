const attendanceService = require('../services/attendance.service');
const { validatePunchInInput } = require('../validators/attendance.validator');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * @desc    Execute GPS Attendance Punch-In
 * @route   POST /api/attendance/punch-in
 * @access  Private (EMPLOYEE & ADMIN)
 */
const punchIn = async (req, res, next) => {
  try {
    const { isValid, errors, latitude, longitude } = validatePunchInInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const deviceInfo = req.body.deviceInfo || req.headers['user-agent'] || 'Browser Client';

    const result = await attendanceService.punchIn(
      req.user.id,
      latitude,
      longitude,
      deviceInfo,
      getClientIp(req)
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully. Welcome!',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's punch-in status for logged-in user
 * @route   GET /api/attendance/today-status
 * @access  Private (EMPLOYEE & ADMIN)
 */
const getTodayStatus = async (req, res, next) => {
  try {
    const result = await attendanceService.getTodayStatus(req.user.id);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's attendance history
 * @route   GET /api/attendance/my-attendance
 * @access  Private (EMPLOYEE & ADMIN)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getMyAttendance(req.user.id, req.query);
    return res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin company-wide attendance monitoring log
 * @route   GET /api/admin/attendance
 * @access  Private (ADMIN Only)
 */
const getAllAttendanceAdmin = async (queryReq, res, next) => {
  try {
    const result = await attendanceService.getAllAttendanceAdmin(queryReq.query);
    return res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchIn,
  getTodayStatus,
  getMyAttendance,
  getAllAttendanceAdmin
};
