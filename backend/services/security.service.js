const prisma = require('../config/prisma');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Record a login attempt in LoginHistory table
 */
const recordLoginAttempt = async (email, success, failureReason, ipAddress, deviceInfo) => {
  return await prisma.loginHistory.create({
    data: {
      email,
      success,
      failureReason: failureReason || null,
      ipAddress: ipAddress || '127.0.0.1',
      deviceInfo: deviceInfo || 'Browser Client'
    }
  });
};

/**
 * Check if user account is currently locked out
 */
const isAccountLocked = (user) => {
  if (!user.lockoutUntil) return false;
  return new Date() < new Date(user.lockoutUntil);
};

/**
 * Increment failed login attempt counter and lock account if >= 5 attempts
 */
const handleFailedLogin = async (user, email, failureReason, ipAddress, deviceInfo) => {
  await recordLoginAttempt(email, false, failureReason, ipAddress, deviceInfo);

  if (!user) return;

  const currentAttempts = user.failedLoginAttempts + 1;
  const updateData = { failedLoginAttempts: currentAttempts };

  if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    updateData.lockoutUntil = lockoutUntil;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });
};

/**
 * Reset failed login attempt counter on successful login
 */
const handleSuccessfulLogin = async (user, email, ipAddress, deviceInfo) => {
  await recordLoginAttempt(email, true, null, ipAddress, deviceInfo);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLogin: new Date()
    }
  });
};

/**
 * Fetch Security Command Center Metrics for Admin
 */
const getSecurityMetrics = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const [
    failedLoginsToday,
    lockedAccountsCount,
    activeSessionsCount,
    recentLoginHistory,
    recentAuditLogs
  ] = await Promise.all([
    prisma.loginHistory.count({
      where: {
        success: false,
        createdAt: { gte: startOfDay }
      }
    }),
    prisma.user.count({
      where: {
        isDeleted: false,
        lockoutUntil: { gt: now }
      }
    }),
    prisma.userSession.count({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: now }
      }
    }),
    prisma.loginHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15
    }),
    prisma.auditLog.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, employeeId: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    })
  ]);

  return {
    failedLoginsToday,
    lockedAccountsCount,
    activeSessionsCount,
    recentLoginHistory,
    recentAuditLogs
  };
};

module.exports = {
  recordLoginAttempt,
  isAccountLocked,
  handleFailedLogin,
  handleSuccessfulLogin,
  getSecurityMetrics,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES
};
