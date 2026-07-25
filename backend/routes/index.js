const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const attendanceRoutes = require('./attendance.routes');
const attendanceController = require('../controllers/attendance.controller');
const analyticsController = require('../controllers/analytics.controller');
const systemAdminController = require('../controllers/systemAdmin.controller');
const securityController = require('../controllers/security.controller');
const adminRegistrationController = require('../controllers/adminRegistration.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { inputSanitizer } = require('../middlewares/sanitizer.middleware');
const { punchInRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Apply Global Input Sanitizer to all routes
router.use(inputSanitizer);

// System Health Endpoint
router.get('/health', securityController.healthCheck);
router.use('/', healthRoutes);

// Auth endpoints
router.use('/auth', authRoutes);

// Admin Pending Employee Registrations (ADMIN Only)
router.get('/admin/pending-registrations', authenticate, authorize('ADMIN'), adminRegistrationController.getPendingRegistrations);
router.post('/admin/pending-registrations/:id/approve', authenticate, authorize('ADMIN'), adminRegistrationController.approveRegistration);
router.post('/admin/pending-registrations/:id/reject', authenticate, authorize('ADMIN'), adminRegistrationController.rejectRegistration);

// Admin Employee Management endpoints
router.use('/admin/employees', employeeRoutes);

// Admin Security Command Center (ADMIN Only)
router.get('/admin/security', authenticate, authorize('ADMIN'), securityController.getSecurityDashboard);

// System Admin & Office / Company Settings (ADMIN Only)
router.get('/admin/office', authenticate, authorize('ADMIN'), systemAdminController.getOffice);
router.put('/admin/office', authenticate, authorize('ADMIN'), systemAdminController.updateOffice);

router.get('/admin/company', authenticate, authorize('ADMIN'), systemAdminController.getCompany);
router.put('/admin/company', authenticate, authorize('ADMIN'), systemAdminController.updateCompany);

router.get('/admin/audit-logs', authenticate, authorize('ADMIN'), systemAdminController.getAuditLogs);

// Profile & Password Management (Authenticated Users)
router.get('/profile', authenticate, systemAdminController.getProfile);
router.put('/profile', authenticate, systemAdminController.updateProfile);
router.patch('/profile/change-password', authenticate, systemAdminController.changePassword);

// Admin Analytics & Export Endpoints (ADMIN Only)
router.get('/admin/attendance/summary', authenticate, authorize('ADMIN'), analyticsController.getSummary);
router.get('/admin/attendance/analytics', authenticate, authorize('ADMIN'), analyticsController.getAnalytics);
router.get('/admin/attendance/export/excel', authenticate, authorize('ADMIN'), analyticsController.exportExcel);
router.get('/admin/attendance/export/csv', authenticate, authorize('ADMIN'), analyticsController.exportCSV);
router.get('/admin/attendance/export/pdf', authenticate, authorize('ADMIN'), analyticsController.exportPDF);

// Admin Attendance Log endpoint
router.get('/admin/attendance', authenticate, authorize('ADMIN'), attendanceController.getAllAttendanceAdmin);

// Attendance endpoints (with punch-in rate limiter)
router.use('/attendance', attendanceRoutes);

module.exports = router;
