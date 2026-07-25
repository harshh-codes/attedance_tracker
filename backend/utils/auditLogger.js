const prisma = require('../config/prisma');

/**
 * Record system audit log entry
 * @param {string|null} userId - ID of the user performing the action
 * @param {string} action - E.g. EMPLOYEE_CREATED, EMPLOYEE_UPDATED, PASSWORD_RESET
 * @param {string} description - Details about the action
 * @param {string|null} ipAddress - Client IP address
 */
const logAudit = async (userId, action, description, ipAddress = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        description,
        ipAddress: ipAddress || '127.0.0.1'
      }
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};

module.exports = {
  logAudit
};
