import api from './api';

const reportService = {
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  getReports: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  updateReportStatus: async (reportId, data) => {
    const response = await api.put(`/reports/${reportId}`, data);
    return response.data;
  }
};

export default reportService;
