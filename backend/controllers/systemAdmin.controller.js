const officeService = require('../services/office.service');
const companyService = require('../services/company.service');
const profileService = require('../services/profile.service');
const auditService = require('../services/audit.service');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

// 1. Office Settings Handlers
const getOffice = async (req, res, next) => {
  try {
    const office = await officeService.getOfficeSettings();
    return res.status(200).json({ success: true, data: { office } });
  } catch (error) {
    next(error);
  }
};

const updateOffice = async (req, res, next) => {
  try {
    const office = await officeService.updateOfficeSettings(req.body, req.user.id, getClientIp(req));
    return res.status(200).json({
      success: true,
      message: 'Office settings updated successfully',
      data: { office }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Company Settings Handlers
const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompanySettings();
    return res.status(200).json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompanySettings(req.body, req.user.id, getClientIp(req));
    return res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      data: { company }
    });
  } catch (error) {
    next(error);
  }
};

// 3. User Profile Handlers
const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getUserProfile(req.user.id);
    return res.status(200).json({ success: true, data: { user: profile } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateUserProfile(req.user.id, req.body, req.user.role, getClientIp(req));
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: profile }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const result = await profileService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
      confirmPassword,
      getClientIp(req)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 4. Audit Logs Handler
const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOffice,
  updateOffice,
  getCompany,
  updateCompany,
  getProfile,
  updateProfile,
  changePassword,
  getAuditLogs
};
