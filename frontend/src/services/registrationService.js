import api from './api';

export const registerEmployee = async (data) => {
  return await api.post('/auth/register', data);
};

export const getBranches = async () => {
  return await api.get('/auth/branches');
};

export const verifyEmailToken = async (token) => {
  return await api.get(`/auth/verify-email?token=${token}`);
};

export const verifyEmailDev = async (email) => {
  return await api.post('/auth/verify-email-dev', { email });
};

export const getPendingRegistrations = async () => {
  return await api.get('/admin/pending-registrations');
};

export const approveRegistration = async (id, data) => {
  return await api.post(`/admin/pending-registrations/${id}/approve`, data);
};

export const rejectRegistration = async (id, data) => {
  return await api.post(`/admin/pending-registrations/${id}/reject`, data);
};

export const requestPasswordReset = async (email) => {
  return await api.post('/auth/forgot-password', { email });
};

export const executePasswordReset = async (data) => {
  return await api.post('/auth/reset-password', data);
};
