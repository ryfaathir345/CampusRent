// src/services/item.service.js
import api from './api';

const itemService = {
  // Get all items with optional filters
  getItems: async (params) => {
    // params can include: search, kategori, status, ownerId
    const response = await api.get('/items', { params });
    return response.data;
  },

  // Get item by ID
  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Create new item
  createItem: async (formData) => {
    // formData must be FormData object since it includes a file
    const response = await api.post('/items', formData);
    return response.data;
  },

  // Update item
  updateItem: async (id, formData) => {
    const response = await api.patch(`/items/${id}`, formData);
    return response.data;
  },

  // Delete item
  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  }
};

export default itemService;
