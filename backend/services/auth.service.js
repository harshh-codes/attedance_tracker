const prisma = require('../config/prisma');
const { comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

/**
 * Authenticate user credentials & return token
 */
const authenticateUser = async (email, password) => {
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is active
  if (!user.isActive) {
    const error = new Error('Account is inactive. Please contact HR or System Administrator');
    error.statusCode = 403;
    throw error;
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate token payload
  const tokenPayload = {
    userId: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role
  };

  const token = generateToken(tokenPayload);

  // Exclude password from returned user object
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

/**
 * Fetch current user profile by ID without password
 */
const getUserById = async (userId) => {
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
      profilePhoto: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  return user;
};

module.exports = {
  authenticateUser,
  getUserById
};
