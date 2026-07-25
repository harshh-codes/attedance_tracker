import api from './api';

export const getOfficeSettings = async () => {
  return await api.get('/admin/office');
};

export const updateOfficeSettings = async (data) => {
  return await api.put('/admin/office', data);
};

export const getCompanySettings = async () => {
  return await api.get('/admin/company');
};

export const updateCompanySettings = async (data) => {
  return await api.put('/admin/company', data);
};

export const getProfile = async () => {
  return await api.get('/profile');
};

export const updateProfile = async (data) => {
  return await api.put('/profile', data);
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  return await api.patch('/profile/change-password', { currentPassword, newPassword, confirmPassword });
};

export const getAuditLogs = async (params) => {
  return await api.get('/admin/audit-logs', { params });
};
