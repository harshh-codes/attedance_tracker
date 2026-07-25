const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Enforce authentication & ADMIN role authorization on all employee management routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.patch('/:id/status', employeeController.updateStatus);
router.patch('/:id/reset-password', employeeController.resetPassword);
router.delete('/:id', employeeController.softDelete);

module.exports = router;
