import api from './api';

export const getSecurityDashboard = async () => {
  return await api.get('/admin/security');
};

export const getUserSessions = async () => {
  return await api.get('/auth/sessions');
};

export const revokeSession = async (sessionId) => {
  return await api.delete(`/auth/sessions/${sessionId}`);
};

export const logoutAll = async () => {
  return await api.post('/auth/logout-all');
};

export const getHealthStatus = async () => {
  return await api.get('/health');
};
