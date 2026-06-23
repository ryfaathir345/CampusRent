// src/services/profile.service.js
import api from './api';

const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.put('/profile/avatar', formData);
    return response.data;
  },

  updateKtm: async (formData) => {
    const response = await api.put('/profile/ktm', formData);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/profile/password', data);
    return response.data;
  },

  getActivities: async () => {
    const response = await api.get('/profile/activities');
    return response.data;
  }
};

export default profileService;
