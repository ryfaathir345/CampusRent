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

  verifyPayment: async (paymentId, action) => {
    const response = await api.patch(`/payments/${paymentId}/verify`, { action });
    return response.data;
  }
};

export default adminService;
