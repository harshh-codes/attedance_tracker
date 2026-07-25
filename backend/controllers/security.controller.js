const prisma = require('../config/prisma');
const securityService = require('../services/security.service');
const sessionService = require('../services/session.service');
const tokenService = require('../services/token.service');

/**
 * @desc    Get Security Command Center Overview for Admin
 * @route   GET /api/admin/security
 * @access  Private (ADMIN Only)
 */
const getSecurityDashboard = async (req, res, next) => {
  try {
    const metrics = await securityService.getSecurityMetrics();
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Active Sessions for Current User
 * @route   GET /api/auth/sessions
 * @access  Private
 */
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user.id);
    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke Specific User Session
 * @route   DELETE /api/auth/sessions/:id
 * @access  Private
 */
const revokeSession = async (req, res, next) => {
  try {
    await tokenService.revokeSession(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enterprise Health Check Endpoint
 * @route   GET /api/health
 * @access  Public
 */
const healthCheck = async (req, res) => {
  const startTime = Date.now();
  let dbStatus = 'DISCONNECTED';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch (err) {
    dbStatus = 'ERROR';
  }

  const memoryUsage = process.memoryUsage();

  return res.status(200).json({
    status: 'UP',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    version: '1.0.0',
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        rssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        heapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024))
      }
    }
  });
};

module.exports = {
  getSecurityDashboard,
  getUserSessions,
  revokeSession,
  healthCheck
};
