// src/services/transaction.service.js
import api from './api';

const transactionService = {
  // Peminjam mengajukan pinjaman
  createRequest: async (data) => {
    // data = { itemId, startDate, endDate }
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Mengajukan pertanyaan terkait barang
  createInquiry: async (data) => {
    const response = await api.post('/transactions/inquiry', data);
    return response.data;
  },

  // Mendapatkan statistik untuk Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/transactions/stats');
    return response.data;
  },

  // Mendapatkan daftar pinjaman yang diajukan oleh user
  getMyBorrowings: async () => {
    const response = await api.get('/transactions/borrowings');
    return response.data;
  },

  // Mendapatkan daftar permintaan masuk dari user lain
  getMyItemRequests: async () => {
    const response = await api.get('/transactions/requests');
    return response.data;
  },

  // Update status oleh Pemilik Barang (Owner)
  // status: APPROVED, REJECTED, COMPLETED
  updateRequestStatus: async (id, status) => {
    const response = await api.patch(`/transactions/${id}/status`, { status });
    return response.data;
  },

  updateBorrowStatus: async (id, status) => {
    const response = await api.patch(`/transactions/${id}/borrow`, { status });
    return response.data;
  },

  // Mengajukan perpanjangan waktu
  requestExtension: async (id, data) => {
    // data = { days, reason }
    const response = await api.post(`/transactions/${id}/extend`, data);
    return response.data;
  },

  // Merespon pengajuan perpanjangan waktu
  respondExtension: async (id, extendId, status) => {
    // status = 'APPROVED' or 'REJECTED'
    const response = await api.patch(`/transactions/${id}/extend/${extendId}`, { status });
    return response.data;
  },

  // Membayar denda keterlambatan
  payPenalty: async (id) => {
    const response = await api.post(`/transactions/${id}/pay-penalty`);
    return response.data;
  }
};

export default transactionService;
