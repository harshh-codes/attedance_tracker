import api from './api';

export const getEmployees = async (params) => {
  return await api.get('/admin/employees', { params });
};

export const getEmployee = async (id) => {
  return await api.get(`/admin/employees/${id}`);
};

export const createEmployee = async (data) => {
  return await api.post('/admin/employees', data);
};

export const updateEmployee = async (id, data) => {
  return await api.put(`/admin/employees/${id}`, data);
};

export const updateEmployeeStatus = async (id, isActive) => {
  return await api.patch(`/admin/employees/${id}/status`, { isActive });
};

export const resetEmployeePassword = async (id, newPassword) => {
  return await api.patch(`/admin/employees/${id}/reset-password`, { newPassword });
};

export const deleteEmployee = async (id) => {
  return await api.delete(`/admin/employees/${id}`);
};
