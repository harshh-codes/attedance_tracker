const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'landmark_super_secret_jwt_key_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'landmark_refresh_super_secret_key_2026';

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate Short-Lived Access Token (15m)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generate Long-Lived Refresh Token (7d)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Create and persist a new active session in UserSession
 */
const createSession = async (userId, refreshToken, ipAddress, deviceInfo) => {
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return await prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash,
      ipAddress: ipAddress || '127.0.0.1',
      deviceInfo: deviceInfo || 'Browser Session',
      status: 'ACTIVE',
      expiresAt
    }
  });
};

/**
 * Rotate Refresh Token on /api/auth/refresh
 */
const rotateRefreshToken = async (oldRefreshToken, ipAddress, deviceInfo) => {
  if (!oldRefreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const oldHash = hashToken(oldRefreshToken);

  const existingSession = await prisma.userSession.findUnique({
    where: { refreshTokenHash: oldHash }
  });

  if (!existingSession || existingSession.status !== 'ACTIVE' || existingSession.expiresAt < new Date()) {
    // Potential Token Reuse Attack: Revoke all user sessions for safety
    await prisma.userSession.updateMany({
      where: { userId: decoded.id },
      data: { status: 'REVOKED' }
    });

    const error = new Error('Security Alert: Refresh token invalid or already reused. All sessions revoked.');
    error.statusCode = 401;
    throw error;
  }

  // Revoke old session
  await prisma.userSession.update({
    where: { id: existingSession.id },
    data: { status: 'REVOKED' }
  });

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, employeeId: true, isActive: true, isDeleted: true }
  });

  if (!user || !user.isActive || user.isDeleted) {
    const error = new Error('User account disabled or deleted');
    error.statusCode = 401;
    throw error;
  }

  // Issue new token pair
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Persist new session
  await createSession(user.id, newRefreshToken, ipAddress, deviceInfo);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user
  };
};

/**
 * Revoke specific session
 */
const revokeSession = async (sessionId, userId) => {
  return await prisma.userSession.updateMany({
    where: { id: sessionId, userId },
    data: { status: 'REVOKED' }
  });
};

/**
 * Revoke all sessions for a user
 */
const revokeAllUserSessions = async (userId) => {
  return await prisma.userSession.updateMany({
    where: { userId, status: 'ACTIVE' },
    data: { status: 'REVOKED' }
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  createSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllUserSessions,
  hashToken
};
