// src/controllers/wallet.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/wallet
// Ambil saldo dan riwayat penarikan
const getWalletInfo = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { saldo: true }
  });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil memuat info dompet', {
    saldo: user.saldo,
    withdrawals
  });
});

// POST /api/wallet/withdraw
// Request penarikan dana
const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankName, accountNumber, accountName } = req.body;

  if (amount < 10000) {
    return errorResponse(res, 400, 'Minimal penarikan adalah Rp 10.000');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user.saldo < amount) {
    return errorResponse(res, 400, 'Saldo tidak mencukupi');
  }

  // Kurangi saldo sementara (di-hold)
  await prisma.user.update({
    where: { id: user.id },
    data: { saldo: { decrement: amount } }
  });

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: user.id,
      amount,
      bankName,
      accountNumber,
      accountName,
      status: 'PENDING'
    }
  });

  return successResponse(res, 201, 'Permintaan penarikan berhasil dibuat', withdrawal);
});

// GET /api/admin/withdrawals
// Ambil semua request penarikan (oleh admin)
const getPendingWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { nama: true, email: true, whatsapp: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil memuat daftar penarikan', withdrawals);
});

// PATCH /api/admin/withdrawals/:id
// Proses penarikan (oleh admin)
const processWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) return errorResponse(res, 404, 'Penarikan tidak ditemukan');
  if (withdrawal.status !== 'PENDING') return errorResponse(res, 400, 'Penarikan sudah diproses');

  if (action === 'approve') {
    await prisma.withdrawal.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Notifikasi
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: 'Penarikan Berhasil',
        message: `Penarikan dana sebesar Rp ${withdrawal.amount.toLocaleString('id-ID')} ke ${withdrawal.bankName} telah berhasil ditransfer.`
      }
    });

    return successResponse(res, 200, 'Penarikan berhasil disetujui');
  } else if (action === 'reject') {
    // Kembalikan saldo
    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: { saldo: { increment: withdrawal.amount } }
    });

    await prisma.withdrawal.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    // Notifikasi
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: 'Penarikan Ditolak',
        message: `Penarikan dana sebesar Rp ${withdrawal.amount.toLocaleString('id-ID')} ditolak. Saldo telah dikembalikan.`
      }
    });

    return successResponse(res, 200, 'Penarikan ditolak');
  }

  return errorResponse(res, 400, 'Action tidak valid');
});

module.exports = {
  getWalletInfo,
  requestWithdrawal,
  getPendingWithdrawals,
  processWithdrawal
};
