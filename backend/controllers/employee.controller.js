const employeeService = require('../services/employee.service');
const {
  validateCreateEmployee,
  validateUpdateEmployee,
  validatePasswordReset
} = require('../validators/employee.validator');

/**
 * Get client IP address helper
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * @desc    Get all employees (Paginated, Filtered, Searched)
 * @route   GET /api/admin/employees
 * @access  Private (ADMIN)
 */
const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    return res.status(200).json({
      success: true,
      data: result.employees,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employee details by ID
 * @route   GET /api/admin/employees/:id
 * @access  Private (ADMIN)
 */
const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return res.status(200).json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee
 * @route   POST /api/admin/employees
 * @access  Private (ADMIN)
 */
const create = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateEmployee(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const newEmployee = await employeeService.createEmployee(
      req.body,
      req.user.id,
      getClientIp(req)
    );

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee: newEmployee }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/admin/employees/:id
 * @access  Private (ADMIN)
 */
const update = async (req, res, next) => {
  try {
    const { isValid, errors } = validateUpdateEmployee(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const updatedEmployee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user.id,
      getClientIp(req)
    );

    return res.status(200).json({
      success: true,
      message: 'Employee details updated successfully',
      data: { employee: updatedEmployee }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate/Deactivate employee
 * @route   PATCH /api/admin/employees/:id/status
 * @access  Private (ADMIN)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "'isActive' boolean field is required"
      });
    }

    const updated = await employeeService.toggleEmployeeStatus(
      req.params.id,
      isActive,
      req.user.id,
      getClientIp(req)
    );

    return res.status(200).json({
      success: true,
      message: `Employee account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { employee: updated }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset employee password
 * @route   PATCH /api/admin/employees/:id/reset-password
 * @access  Private (ADMIN)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePasswordReset(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    const result = await employeeService.resetEmployeePassword(
      req.params.id,
      req.body.newPassword,
      req.user.id,
      getClientIp(req)
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete employee record
 * @route   DELETE /api/admin/employees/:id
 * @access  Private (ADMIN)
 */
const softDelete = async (req, res, next) => {
  try {
    const result = await employeeService.softDeleteEmployee(
      req.params.id,
      req.user.id,
      getClientIp(req)
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  create,
  update,
  updateStatus,
  resetPassword,
  softDelete
};
