// src/services/owner.service.js
import api from './api';

const getDashboardStats = async () => {
  const response = await api.get('/owner/stats');
  return response.data;
};

const getRevenueChart = async () => {
  const response = await api.get('/owner/revenue-chart');
  return response.data;
};

const getTopItems = async () => {
  const response = await api.get('/owner/top-items');
  return response.data;
};

const ownerService = {
  getDashboardStats,
  getRevenueChart,
  getTopItems
};

export default ownerService;
