const prisma = require('../config/prisma');

/**
 * Get active & historical sessions for an individual user
 */
const getUserSessions = async (userId) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return sessions.map(s => ({
    id: s.id,
    ipAddress: s.ipAddress,
    deviceInfo: s.deviceInfo,
    status: s.status,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: s.status === 'ACTIVE' && s.expiresAt > new Date()
  }));
};

/**
 * Get company-wide active user sessions for Admin Security Command Center
 */
const getAllActiveSessionsAdmin = async () => {
  const activeSessions = await prisma.userSession.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { gt: new Date() }
    },
    include: {
      user: {
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
          email: true,
          department: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return activeSessions;
};

module.exports = {
  getUserSessions,
  getAllActiveSessionsAdmin
};
