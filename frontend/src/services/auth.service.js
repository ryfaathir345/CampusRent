// src/services/auth.service.js
// Auth API service — semua request ke /api/auth

import api from './api';

const authService = {
  /**
   * Register mahasiswa baru
   * @param {{ nama, email, password, nim?, jurusan?, whatsapp? }} data
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * @param {{ email, password }} credentials
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout (hapus token dari server side)
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — tetap hapus token di client
    }
  },

  /**
   * Ambil profil user yang sedang login
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update profil user
   * @param {{ nama?, jurusan?, whatsapp?, fotoProfil? }} data
   */
  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  /**
   * Ganti password
   * @param {{ currentPassword, newPassword }} data
   */
  changePassword: async (data) => {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  /**
   * Request reset link
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {{ token, newPassword }} data
   */
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export default authService;
