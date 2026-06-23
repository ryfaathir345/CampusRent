// src/controllers/payment.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');

// POST /api/payments/:transactionId
// Unggah bukti pembayaran (oleh peminjam)
const uploadPaymentProof = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  
  if (!req.file) {
    return errorResponse(res, 400, 'Bukti pembayaran wajib diunggah');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (transaction.borrowerId !== req.user.id) return errorResponse(res, 403, 'Akses ditolak');
  if (transaction.status !== 'APPROVED') return errorResponse(res, 400, 'Status transaksi tidak valid untuk pembayaran');

  const buktiUrl = `/uploads/${req.file.filename}`;

  const payment = await prisma.payment.create({
    data: {
      transactionId,
      userId: req.user.id,
      amount: transaction.totalPrice,
      buktiUrl,
      status: 'PENDING'
    }
  });

  // Update status transaksi menjadi WAITING_VERIFICATION
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'WAITING_VERIFICATION' }
  });

  return successResponse(res, 201, 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.', payment);
});

// GET /api/payments/pending
// Ambil semua pembayaran yang menunggu verifikasi (oleh admin)
const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { nama: true, email: true } },
      transaction: { include: { item: { select: { namaBarang: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil memuat daftar pembayaran pending', payments);
});

// PATCH /api/payments/:id/verify
// Verifikasi pembayaran (oleh admin)
const verifyPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return errorResponse(res, 404, 'Pembayaran tidak ditemukan');

  if (action === 'approve') {
    await prisma.payment.update({
      where: { id },
      data: { status: 'VERIFIED' }
    });

    await prisma.transaction.update({
      where: { id: payment.transactionId },
      data: { status: 'PAID' }
    });

    return successResponse(res, 200, 'Pembayaran berhasil disetujui');
  } else if (action === 'reject') {
    await prisma.payment.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    await prisma.transaction.update({
      where: { id: payment.transactionId },
      data: { status: 'APPROVED' } // Kembali ke status APPROVED agar user bisa upload ulang
    });

    // Hapus file invoice dari folder uploads
    if (payment.buktiUrl) {
      try {
        const oldPath = path.join(__dirname, '../../public', payment.buktiUrl.trim());
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        console.error('Error deleting rejected payment proof:', error);
      }
    }

    return successResponse(res, 200, 'Pembayaran ditolak');
  }

  return errorResponse(res, 400, 'Action tidak valid');
});

// GET /api/admin/revenue
// Ambil statistik pendapatan admin (Day to day)
const getAdminRevenue = asyncHandler(async (req, res) => {
  // Ambil semua transaksi yang sudah COMPLETED
  const completedTransactions = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { updatedAt: 'asc' }
  });

  let totalRevenue = 0;
  const dailyData = {};

  completedTransactions.forEach(tx => {
    // Admin mendapat 10% dari totalPrice
    const adminFee = Math.floor(tx.totalPrice * 0.1);
    totalRevenue += adminFee;

    // Format tanggal ke YYYY-MM-DD
    const date = new Date(tx.updatedAt).toISOString().split('T')[0];
    
    if (!dailyData[date]) {
      dailyData[date] = 0;
    }
    dailyData[date] += adminFee;
  });

  // Convert dictionary to array for recharts
  const chartData = Object.keys(dailyData).map(date => ({
    date,
    revenue: dailyData[date]
  }));

  return successResponse(res, 200, 'Berhasil memuat data pendapatan', {
    totalRevenue,
    chartData
  });
});

module.exports = {
  uploadPaymentProof,
  getPendingPayments,
  verifyPayment,
  getAdminRevenue
};
