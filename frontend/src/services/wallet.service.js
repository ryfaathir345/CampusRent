// src/services/wallet.service.js
import api from './api';

export const getWalletInfo = async () => {
  const response = await api.get('/wallet');
  return response.data;
};

export const requestWithdrawal = async (data) => {
  const response = await api.post('/wallet/withdraw', data);
  return response.data;
};

export const getPendingWithdrawals = async () => {
  const response = await api.get('/wallet/withdrawals/pending');
  return response.data;
};

export const processWithdrawal = async (id, action) => {
  const response = await api.patch(`/wallet/withdrawals/${id}`, { action });
  return response.data;
};

export const requestTopUp = async (formData) => {
  const response = await api.post('/wallet/topup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getPendingTopUps = async () => {
  const response = await api.get('/wallet/topups/pending');
  return response.data;
};

export const processTopUp = async (id, action) => {
  const response = await api.patch(`/wallet/topups/${id}`, { action });
  return response.data;
};
