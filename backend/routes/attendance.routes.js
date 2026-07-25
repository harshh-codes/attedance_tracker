const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All attendance routes require authentication
router.use(authenticate);

// Employee & Admin routes
router.post('/punch-in', attendanceController.punchIn);
router.get('/today-status', attendanceController.getTodayStatus);
router.get('/my-attendance', attendanceController.getMyAttendance);

// Admin-Only company-wide attendance monitoring route
router.get('/admin-all', authorize('ADMIN'), attendanceController.getAllAttendanceAdmin);

module.exports = router;
