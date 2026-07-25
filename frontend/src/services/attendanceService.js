import api from './api';

export const getTodayStatus = async () => {
  return await api.get('/attendance/today-status');
};

export const punchIn = async (latitude, longitude, deviceInfo) => {
  return await api.post('/attendance/punch-in', { latitude, longitude, deviceInfo });
};

export const getMyAttendance = async (params) => {
  return await api.get('/attendance/my-attendance', { params });
};

export const getAdminAttendance = async (params) => {
  return await api.get('/admin/attendance', { params });
};
