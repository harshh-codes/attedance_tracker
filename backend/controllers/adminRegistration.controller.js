const prisma = require('../config/prisma');
const { logAudit } = require('../utils/auditLogger');
const { sendApprovalEmail, sendRejectionEmail } = require('../services/email.service');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * Helper to auto-generate unique Employee ID if not provided (e.g. EMP-106)
 */
const generateNextEmployeeId = async () => {
  const lastUser = await prisma.user.findFirst({
    where: { employeeId: { startsWith: 'EMP-' } },
    orderBy: { createdAt: 'desc' }
  });

  if (!lastUser || !lastUser.employeeId) {
    return 'EMP-101';
  }

  const match = lastUser.employeeId.match(/^EMP-(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `EMP-${nextNum}`;
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  return `EMP-${randomNum}`;
};

/**
 * @desc    Get all pending employee registrations
 * @route   GET /api/admin/pending-registrations
 * @access  Private (ADMIN Only)
 */
const getPendingRegistrations = async (req, res, next) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        accountStatus: 'PENDING_ADMIN_APPROVAL',
        isDeleted: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        designation: true,
        department: true,
        profilePhoto: true,
        accountStatus: true,
        isEmailVerified: true,
        createdAt: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            officeName: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve employee registration, assign department & employee ID, activate account
 * @route   POST /api/admin/pending-registrations/:id/approve
 * @access  Private (ADMIN Only)
 */
const approveRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department, designation, employeeId } = req.body;
    const ipAddress = getClientIp(req);

    if (!department || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department assignment is required to approve employee registration'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    if (user.accountStatus === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Employee account is already approved' });
    }

    // Determine final Employee ID
    let finalEmployeeId = employeeId ? employeeId.trim() : user.employeeId;
    if (!finalEmployeeId) {
      finalEmployeeId = await generateNextEmployeeId();
    }

    // Check Employee ID uniqueness
    const existingEmpId = await prisma.user.findFirst({
      where: {
        employeeId: finalEmployeeId,
        id: { not: user.id }
      }
    });
    if (existingEmpId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${finalEmployeeId}' is already assigned to another employee.`
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        department: department.trim(),
        designation: designation ? designation.trim() : user.designation,
        employeeId: finalEmployeeId,
        accountStatus: 'APPROVED',
        isActive: true,
        rejectionReason: null
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
        accountStatus: true,
        isActive: true,
        createdAt: true,
        branch: { select: { officeName: true } }
      }
    });

    await logAudit(
      req.user.id,
      'REGISTRATION_APPROVED',
      `Admin approved registration for ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}). Assigned ID: ${updatedUser.employeeId}, Dept: ${updatedUser.department}.`,
      ipAddress
    );

    // Send Approval Email
    await sendApprovalEmail(updatedUser.email, updatedUser.firstName, updatedUser.employeeId, updatedUser.department);

    return res.status(200).json({
      success: true,
      message: `Employee registration for ${updatedUser.firstName} ${updatedUser.lastName} approved successfully! Account activated.`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject employee registration with reason
 * @route   POST /api/admin/pending-registrations/:id/reject
 * @access  Private (ADMIN Only)
 */
const rejectRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const ipAddress = getClientIp(req);

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A clear rejection reason is required to reject an application'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        isActive: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accountStatus: true,
        rejectionReason: true,
        isActive: true
      }
    });

    await logAudit(
      req.user.id,
      'REGISTRATION_REJECTED',
      `Admin rejected registration for ${updatedUser.email}. Reason: ${rejectionReason.trim()}`,
      ipAddress
    );

    // Send Rejection Email
    await sendRejectionEmail(updatedUser.email, updatedUser.firstName, rejectionReason.trim());

    return res.status(200).json({
      success: true,
      message: `Registration for ${updatedUser.firstName} ${updatedUser.lastName} has been rejected. Notification recorded.`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration
};
