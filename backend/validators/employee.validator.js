/**
 * Validate employee creation input payload
 */
const validateCreateEmployee = (body) => {
  const errors = {};

  const employeeId = body.employeeId ? body.employeeId.trim() : '';
  const firstName = body.firstName ? body.firstName.trim() : '';
  const lastName = body.lastName ? body.lastName.trim() : '';
  const email = body.email ? body.email.trim() : '';
  const phone = body.phone ? body.phone.trim() : '';
  const department = body.department ? body.department.trim() : '';
  const designation = body.designation ? body.designation.trim() : '';
  const role = body.role ? body.role.toUpperCase().trim() : 'EMPLOYEE';
  const password = body.password ? body.password : '';

  if (!employeeId) {
    errors.employeeId = 'Employee ID is required';
  }

  if (!firstName) {
    errors.firstName = 'First Name is required';
  }

  if (!lastName) {
    errors.lastName = 'Last Name is required';
  }

  if (!email) {
    errors.email = 'Email address is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  if (phone) {
    const phoneRegex = /^[+]*[0-9\s-]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  if (!department) {
    errors.department = 'Department is required';
  }

  if (!designation) {
    errors.designation = 'Designation is required';
  }

  if (!['ADMIN', 'EMPLOYEE'].includes(role)) {
    errors.role = 'Role must be either ADMIN or EMPLOYEE';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Validate employee update input payload
 */
const validateUpdateEmployee = (body) => {
  const errors = {};

  const firstName = body.firstName ? body.firstName.trim() : '';
  const lastName = body.lastName ? body.lastName.trim() : '';
  const phone = body.phone ? body.phone.trim() : '';
  const department = body.department ? body.department.trim() : '';
  const designation = body.designation ? body.designation.trim() : '';
  const role = body.role ? body.role.toUpperCase().trim() : '';

  if (!firstName) errors.firstName = 'First Name is required';
  if (!lastName) errors.lastName = 'Last Name is required';
  if (!department) errors.department = 'Department is required';
  if (!designation) errors.designation = 'Designation is required';

  if (role && !['ADMIN', 'EMPLOYEE'].includes(role)) {
    errors.role = 'Role must be either ADMIN or EMPLOYEE';
  }

  if (phone) {
    const phoneRegex = /^[+]*[0-9\s-]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Validate password reset payload
 */
const validatePasswordReset = (body) => {
  const errors = {};
  const newPassword = body.newPassword ? body.newPassword : '';

  if (!newPassword) {
    errors.newPassword = 'New password is required';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

module.exports = {
  validateCreateEmployee,
  validateUpdateEmployee,
  validatePasswordReset
};
