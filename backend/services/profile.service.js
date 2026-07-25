const prisma = require('../config/prisma');
const { comparePassword, hashPassword } = require('../utils/password');
const { logAudit } = require('../utils/auditLogger');

/**
 * Fetch profile details for authenticated user
 */
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update user profile details
 * - ADMIN can update: photo, phone, firstName, lastName
 * - EMPLOYEE can update: photo, phone, emergencyContact, address
 * - Immutable: employeeId, role, department, designation
 */
const updateUserProfile = async (userId, data, role, ipAddress) => {
  const current = await getUserProfile(userId);

  const updateData = {};

  if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
  if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;

  if (role === 'ADMIN') {
    if (data.firstName) updateData.firstName = data.firstName.trim();
    if (data.lastName) updateData.lastName = data.lastName.trim();
  }

  if (role === 'EMPLOYEE' || role === 'ADMIN') {
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact ? data.emergencyContact.trim() : null;
    if (data.address !== undefined) updateData.address = data.address ? data.address.trim() : null;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await logAudit(
    userId,
    'PROFILE_UPDATED',
    `Updated profile info for ${updated.firstName} ${updated.lastName} (${updated.employeeId})`,
    ipAddress
  );

  return updated;
};

/**
 * Change password for authenticated user
 */
const changePassword = async (userId, currentPassword, newPassword, confirmPassword, ipAddress) => {
  if (!currentPassword) {
    const error = new Error('Current password is required');
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword) {
    const error = new Error('New password is required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error('New password and confirm password do not match');
    error.statusCode = 400;
    throw error;
  }

  // Password Complexity Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    const error = new Error(
      'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&#)'
    );
    error.statusCode = 400;
    throw error;
  }

  // Retrieve user with hashed password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Incorrect current password');
    error.statusCode = 400;
    throw error;
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  await logAudit(
    userId,
    'PASSWORD_CHANGED',
    `Successfully changed password for user ${user.email}`,
    ipAddress
  );

  return { success: true, message: 'Password changed successfully' };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword
};
