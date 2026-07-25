const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const securityController = require('../controllers/security.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginRateLimiter, forgotPasswordRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Public Auth Endpoints
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email-dev', authController.verifyEmailDev);
router.get('/branches', authController.getBranches);
router.post('/login', loginRateLimiter, authController.login);
router.post('/forgot-password', forgotPasswordRateLimiter, authController.forgotPassword);
router.post('/reset-password', forgotPasswordRateLimiter, authController.resetPassword);
router.post('/refresh', authController.refresh);

// Protected Auth & Session Endpoints
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.getMe);

// Session Management Endpoints
router.get('/sessions', authenticate, securityController.getUserSessions);
router.delete('/sessions/:id', authenticate, securityController.revokeSession);

module.exports = router;
