const crypto = require('crypto');
const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, createSession, rotateRefreshToken, revokeSession, revokeAllUserSessions } = require('../services/token.service');
const { isAccountLocked, handleFailedLogin, handleSuccessfulLogin } = require('../services/security.service');
const { logAudit } = require('../utils/auditLogger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * @desc    Public Employee Self Registration
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      designation,
      branchId,
      password,
      confirmPassword,
      profilePhoto,
      termsAccepted
    } = req.body;

    const ipAddress = getClientIp(req);

    // 1. Mandatory field validations
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: 'Designation is required' });
    }
    if (!branchId) {
      return res.status(400).json({ success: false, message: 'Branch selection is required' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept the Terms & Conditions to register' });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    // 3. Password validation
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and Confirm Password do not match' });
    }

    // 4. Unique email check
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    // 5. Verify branch exists
    const branch = await prisma.officeLocation.findUnique({
      where: { id: branchId }
    });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Selected branch/office location is invalid' });
    }

    // 6. Generate email verification token & hash password
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await hashPassword(password);

    // 7. Create user with default self-registration status
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        designation: designation.trim(),
        branchId: branch.id,
        profilePhoto: profilePhoto || null,
        role: 'EMPLOYEE',
        department: null,
        employeeId: null,
        accountStatus: 'PENDING_EMAIL_VERIFICATION',
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        isActive: false
      }
    });

    await logAudit(
      newUser.id,
      'EMPLOYEE_SELF_REGISTERED',
      `Employee ${newUser.email} registered account. Pending email verification.`,
      ipAddress
    );

    // Send Verification Email
    await sendVerificationEmail(newUser.email, newUser.firstName, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email address to proceed.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        verificationToken, // Returned for dev testing & direct verification link
        accountStatus: newUser.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address via token
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired email verification token' });
    }

    // Update status to PENDING_ADMIN_APPROVAL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        accountStatus: 'PENDING_ADMIN_APPROVAL'
      }
    });

    await logAudit(
      updatedUser.id,
      'EMAIL_VERIFIED',
      `User ${updatedUser.email} verified email address. Status updated to PENDING_ADMIN_APPROVAL.`,
      getClientIp(req)
    );

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully! Your account is now pending Administrator approval.',
      data: {
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dev mode instant email verification helper
 * @route   POST /api/auth/verify-email-dev
 * @access  Public
 */
const verifyEmailDev = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        accountStatus: 'PENDING_ADMIN_APPROVAL'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified! Account is now pending Admin approval.',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active branches for registration dropdown
 * @route   GET /api/auth/branches
 * @access  Public
 */
const getBranches = async (req, res, next) => {
  try {
    const branches = await prisma.officeLocation.findMany({
      where: { isActive: true },
      select: {
        id: true,
        officeName: true,
        address: true
      }
    });
    return res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & issue Access + Refresh token pair
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIp(req);
    const deviceInfo = req.headers['user-agent'] || 'Browser Client';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user || user.isDeleted) {
      await handleFailedLogin(null, trimmedEmail, 'Invalid credentials', ipAddress, deviceInfo);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 2. Check Email Verification & Registration Approval Status
    if (!user.isEmailVerified || user.accountStatus === 'PENDING_EMAIL_VERIFICATION') {
      await handleFailedLogin(user, trimmedEmail, 'Email not verified', ipAddress, deviceInfo);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        accountStatus: 'PENDING_EMAIL_VERIFICATION'
      });
    }

    if (user.accountStatus === 'PENDING_ADMIN_APPROVAL') {
      await handleFailedLogin(user, trimmedEmail, 'Pending admin approval', ipAddress, deviceInfo);
      return res.status(403).json({
        success: false,
        message: 'Your registration request is pending administrator approval. You will be able to log in once approved.',
        accountStatus: 'PENDING_ADMIN_APPROVAL'
      });
    }

    if (user.accountStatus === 'REJECTED') {
      await handleFailedLogin(user, trimmedEmail, 'Registration rejected', ipAddress, deviceInfo);
      return res.status(403).json({
        success: false,
        message: `Your registration request was rejected. Reason: ${user.rejectionReason || 'Contact Administrator for assistance.'}`,
        accountStatus: 'REJECTED',
        rejectionReason: user.rejectionReason
      });
    }

    // 3. Check if user is active
    if (!user.isActive) {
      await handleFailedLogin(user, trimmedEmail, 'Account deactivated', ipAddress, deviceInfo);
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact Administrator.'
      });
    }

    // 4. Check Account Lockout Policy
    if (isAccountLocked(user)) {
      const minutesRemaining = Math.ceil((new Date(user.lockoutUntil) - new Date()) / (1000 * 60));
      await handleFailedLogin(user, trimmedEmail, 'Account locked out', ipAddress, deviceInfo);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`
      });
    }

    // 5. Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await handleFailedLogin(user, trimmedEmail, 'Incorrect password', ipAddress, deviceInfo);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 5. Successful login: reset lockout counter & record history
    await handleSuccessfulLogin(user, trimmedEmail, ipAddress, deviceInfo);

    // 6. Generate Access Token (15m) & Refresh Token (7d)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 7. Persist session
    await createSession(user.id, refreshToken, ipAddress, deviceInfo);

    // 8. Set HTTP-only Cookies
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log Audit Entry
    await logAudit(user.id, 'LOGIN', `User ${user.email} logged in successfully`, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          designation: user.designation,
          department: user.department,
          role: user.role,
          profilePhoto: user.profilePhoto
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rotate Refresh Token & Issue new Access Token
 * @route   POST /api/auth/refresh
 * @access  Public (via HTTP-only Cookie)
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = getClientIp(req);
    const deviceInfo = req.headers['user-agent'] || 'Browser Client';

    const result = await rotateRefreshToken(refreshToken, ipAddress, deviceInfo);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { user: result.user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user session
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const ipAddress = getClientIp(req);

    if (userId) {
      await logAudit(userId, 'LOGOUT', `User logged out session`, ipAddress);
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout all sessions for current user
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ipAddress = getClientIp(req);

    await revokeAllUserSessions(userId);
    await logAudit(userId, 'LOGOUT_ALL', `Logged out all active user sessions`, ipAddress);

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'All sessions logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        emergencyContact: true,
        address: true,
        designation: true,
        department: true,
        role: true,
        isActive: true,
        profilePhoto: true,
        createdAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized or account inactive'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request Password Reset Link (Sends email with 15-minute token)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ipAddress = getClientIp(req);

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Security Response Message (never reveal user non-existence)
    const securityMessage = 'If an account with this email exists, a password reset link has been sent.';

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user || user.isDeleted) {
      // Return identical success response to prevent email enumeration attacks
      return res.status(200).json({
        success: true,
        message: securityMessage
      });
    }

    // Generate secure random raw token & SHA-256 hashed token for DB storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: expiresAt
      }
    });

    // Send Password Reset Email
    await sendPasswordResetEmail(user.email, user.firstName, rawToken);

    // Audit Log Entry
    await logAudit(
      user.id,
      'PASSWORD_RESET_REQUESTED',
      `Password reset link requested for ${user.email}`,
      ipAddress
    );

    return res.status(200).json({
      success: true,
      message: securityMessage,
      devToken: rawToken // Returned for easy local dev testing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Execute Password Reset using Token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const ipAddress = getClientIp(req);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is missing'
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are required'
      });
    }

    // Password Complexity Rules: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Hash incoming raw token to compare against stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { gt: new Date() },
        isDeleted: false
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new link.'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password & clear reset token fields & reset lockout status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockoutUntil: null
      }
    });

    // Revoke all existing sessions for security
    await revokeAllUserSessions(user.id);

    // Audit Log Entry
    await logAudit(
      user.id,
      'PASSWORD_RESET_COMPLETED',
      `Password successfully reset for ${user.email}`,
      ipAddress
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  verifyEmailDev,
  getBranches,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword
};
