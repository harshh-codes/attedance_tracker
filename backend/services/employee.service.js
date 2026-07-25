const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');
const { logAudit } = require('../utils/auditLogger');

/**
 * Fetch paginated, filtered, and searched employee list
 */
const getAllEmployees = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, department, role, status, designation, sortBy } = query;

  // Build Prisma WHERE clause
  const where = {
    isDeleted: false
  };

  // Search filter across employeeId, firstName, lastName, email, department, designation
  if (search && search.trim() !== '') {
    const searchTerm = search.trim();
    where.OR = [
      { employeeId: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { department: { contains: searchTerm, mode: 'insensitive' } },
      { designation: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  // Exact / Filter criteria
  if (department && department.trim() !== '') {
    where.department = { equals: department.trim(), mode: 'insensitive' };
  }

  if (designation && designation.trim() !== '') {
    where.designation = { equals: designation.trim(), mode: 'insensitive' };
  }

  if (role && ['ADMIN', 'EMPLOYEE'].includes(role.toUpperCase())) {
    where.role = role.toUpperCase();
  }

  if (status) {
    if (status.toLowerCase() === 'active') where.isActive = true;
    if (status.toLowerCase() === 'inactive') where.isActive = false;
  }

  // Determine OrderBy Sorting
  let orderBy = { createdAt: 'desc' }; // default: newest
  if (sortBy) {
    switch (sortBy.toLowerCase()) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name_asc':
        orderBy = { firstName: 'asc' };
        break;
      case 'name_desc':
        orderBy = { firstName: 'desc' };
        break;
      case 'department':
        orderBy = { department: 'asc' };
        break;
      case 'employeeid':
        orderBy = { employeeId: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
  }

  // Select fields excluding password
  const selectFields = {
    id: true,
    employeeId: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    designation: true,
    department: true,
    role: true,
    isActive: true,
    profilePhoto: true,
    createdAt: true,
    updatedAt: true
  };

  // Run Count & Data Queries in Parallel
  const [totalRecords, employees] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: selectFields,
      orderBy,
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    employees,
    pagination: {
      totalRecords,
      totalPages,
      page,
      limit
    }
  };
};

/**
 * Fetch employee profile details by ID
 */
const getEmployeeById = async (id) => {
  const employee = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      designation: true,
      department: true,
      role: true,
      isActive: true,
      profilePhoto: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

/**
 * Create a new employee record
 */
const createEmployee = async (data, adminUserId, ipAddress) => {
  const normalizedEmail = data.email.toLowerCase().trim();
  const normalizedEmployeeId = data.employeeId.trim();

  // Check unique employeeId
  const existingEmployeeId = await prisma.user.findFirst({
    where: { employeeId: normalizedEmployeeId, isDeleted: false }
  });
  if (existingEmployeeId) {
    const error = new Error(`Employee ID '${normalizedEmployeeId}' is already registered`);
    error.statusCode = 400;
    throw error;
  }

  // Check unique email
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (existingEmail && !existingEmail.isDeleted) {
    const error = new Error(`Email address '${normalizedEmail}' is already in use`);
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  const newEmployee = await prisma.user.create({
    data: {
      employeeId: normalizedEmployeeId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: data.phone ? data.phone.trim() : null,
      department: data.department.trim(),
      designation: data.designation.trim(),
      role: data.role ? data.role.toUpperCase() : 'EMPLOYEE',
      profilePhoto: data.profilePhoto || null,
      isActive: true,
      isDeleted: false
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      designation: true,
      department: true,
      role: true,
      isActive: true,
      profilePhoto: true,
      createdAt: true,
      updatedAt: true
    }
  });

  // Log Audit Entry
  await logAudit(
    adminUserId,
    'EMPLOYEE_CREATED',
    `Created new employee record: ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`,
    ipAddress
  );

  return newEmployee;
};

/**
 * Update employee record (preserving employeeId)
 */
const updateEmployee = async (id, data, adminUserId, ipAddress) => {
  const existing = await getEmployeeById(id);

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: {
      firstName: data.firstName ? data.firstName.trim() : existing.firstName,
      lastName: data.lastName ? data.lastName.trim() : existing.lastName,
      phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone,
      department: data.department ? data.department.trim() : existing.department,
      designation: data.designation ? data.designation.trim() : existing.designation,
      role: data.role ? data.role.toUpperCase() : existing.role,
      profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : existing.profilePhoto
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      designation: true,
      department: true,
      role: true,
      isActive: true,
      profilePhoto: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await logAudit(
    adminUserId,
    'EMPLOYEE_UPDATED',
    `Updated profile for employee: ${updated.firstName} ${updated.lastName} (${updated.employeeId})`,
    ipAddress
  );

  return updated;
};

/**
 * Toggle employee active/inactive status
 */
const toggleEmployeeStatus = async (id, isActive, adminUserId, ipAddress) => {
  const existing = await getEmployeeById(id);

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { isActive },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  const action = isActive ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED';
  const desc = `${isActive ? 'Activated' : 'Deactivated'} account for employee: ${updated.firstName} ${updated.lastName} (${updated.employeeId})`;

  await logAudit(adminUserId, action, desc, ipAddress);

  return updated;
};

/**
 * Reset employee password
 */
const resetEmployeePassword = async (id, newPassword, adminUserId, ipAddress) => {
  const existing = await getEmployeeById(id);
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: existing.id },
    data: { password: hashedPassword }
  });

  await logAudit(
    adminUserId,
    'PASSWORD_RESET',
    `Reset password for employee: ${existing.firstName} ${existing.lastName} (${existing.employeeId})`,
    ipAddress
  );

  return { success: true, message: `Password reset successfully for ${existing.firstName} ${existing.lastName}` };
};

/**
 * Soft delete employee record
 */
const softDeleteEmployee = async (id, adminUserId, ipAddress) => {
  const existing = await getEmployeeById(id);

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      isDeleted: true,
      isActive: false
    }
  });

  await logAudit(
    adminUserId,
    'EMPLOYEE_DELETED',
    `Soft deleted employee record: ${existing.firstName} ${existing.lastName} (${existing.employeeId})`,
    ipAddress
  );

  return { success: true, message: `Employee '${existing.employeeId}' soft deleted successfully` };
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
  softDeleteEmployee
};
