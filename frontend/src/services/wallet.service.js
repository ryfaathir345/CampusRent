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
