import api from './api';

export const getTodaySummary = async () => {
  return await api.get('/admin/attendance/summary');
};

export const getAnalytics = async (params) => {
  return await api.get('/admin/attendance/analytics', { params });
};

/**
 * Trigger report download (CSV, Excel, PDF)
 */
export const downloadReport = async (format = 'excel', params = {}) => {
  const response = await api.get(`/admin/attendance/export/${format}`, {
    params,
    responseType: 'blob'
  });

  const mimeTypes = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    pdf: 'text/html'
  };

  const extensions = {
    excel: 'xlsx',
    csv: 'csv',
    pdf: 'html'
  };

  const blob = new Blob([response], { type: mimeTypes[format] || 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `landmark_attendance_report_${new Date().toISOString().split('T')[0]}.${extensions[format]}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
