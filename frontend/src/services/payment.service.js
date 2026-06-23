// src/services/payment.service.js
import api from './api';

export const uploadPaymentProof = async (transactionId, file) => {
  const formData = new FormData();
  formData.append('buktiPembayaran', file);
  const response = await api.post(`/payments/${transactionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getPendingPayments = async () => {
  const response = await api.get('/payments/pending');
  return response.data;
};

export const verifyPayment = async (id, action) => {
  const response = await api.patch(`/payments/${id}/verify`, { action });
  return response.data;
};

export const getAdminRevenue = async () => {
  const response = await api.get('/payments/revenue');
  return response.data;
};
