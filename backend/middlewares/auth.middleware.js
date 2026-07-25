const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

/**
 * Authentication Middleware
 * Extracts JWT token from HTTP-only cookie or Authorization header, validates it, and attaches current user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract token from HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Fallback to Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload. Please log in again.'
      });
    }

    // Fetch fresh user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        profilePhoto: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account has been deactivated.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.'
      });
    }
    next(error);
  }
};

/**
 * Authorization Middleware
 * Restricts route access to users with specified roles.
 * @param  {...string} allowedRoles - List of allowed roles (e.g. 'ADMIN', 'EMPLOYEE')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden access. Role '${req.user.role}' is not authorized to perform this action.`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
