// src/services/admin.service.js
import api from './api';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUnverifiedUsers: async () => {
    const response = await api.get('/admin/users/unverified');
    return response.data;
  },

  toggleUserSuspend: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  verifyAllKtm: async () => {
    const response = await api.put('/admin/users/verify-all');
    return response.data;
  },

  verifyKtm: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}/verify`, data);
    return response.data;
  },

  getItems: async () => {
    const response = await api.get('/admin/items');
    return response.data;
  },

  toggleItemBan: async (itemId) => {
    const response = await api.put(`/admin/items/${itemId}/ban`);
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/admin/transactions');
    return response.data;
  },

  deleteItem: async (itemId) => {
    const response = await api.delete(`/admin/items/${itemId}`);
    return response.data;
  },

  verifyPayment: async (paymentId, action) => {
    const response = await api.patch(`/payments/${paymentId}/verify`, { action });
    return response.data;
  },

  // Dashboard widget endpoints
  getMonthlyTarget: async () => {
    const response = await api.get('/admin/dashboard/monthly-target');
    return response.data;
  },

  setMonthlyTarget: async (targetRevenue) => {
    const response = await api.put('/admin/dashboard/monthly-target', { targetRevenue });
    return response.data;
  },

  getMonthlySales: async (year) => {
    const response = await api.get('/admin/dashboard/monthly-sales', { params: { year } });
    return response.data;
  },

  getDailyStats: async (days = 30, startDate = null, endDate = null) => {
    const params = { days };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await api.get('/admin/dashboard/daily-stats', { params });
    return response.data;
  },

  getRecentTransactions: async (limit = 5) => {
    const response = await api.get('/admin/dashboard/recent-transactions', { params: { limit } });
    return response.data;
  },

  getDemographic: async () => {
    const response = await api.get('/admin/dashboard/demographic');
    return response.data;
  },
};

export default adminService;

