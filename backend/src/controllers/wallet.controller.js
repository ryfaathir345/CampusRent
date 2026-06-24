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

  const topUps = await prisma.topUp.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil memuat info dompet', {
    saldo: user.saldo,
    withdrawals,
    topUps
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

// POST /api/wallet/topup
// Request Top Up Saldo
const requestTopUp = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numAmount = parseInt(amount);

  if (!numAmount || numAmount < 10000) {
    return errorResponse(res, 400, 'Minimal top up adalah Rp 10.000');
  }

  if (!req.file) {
    return errorResponse(res, 400, 'Bukti transfer wajib diunggah');
  }

  const topUp = await prisma.topUp.create({
    data: {
      userId: req.user.id,
      amount: numAmount,
      buktiUrl: `/uploads/${req.file.filename}`,
      status: 'PENDING'
    }
  });

  return successResponse(res, 201, 'Permintaan top up berhasil dibuat, menunggu verifikasi Admin', topUp);
});

// GET /api/admin/topups
// Ambil semua request Top Up (oleh admin)
const getPendingTopUps = asyncHandler(async (req, res) => {
  const topUps = await prisma.topUp.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { nama: true, email: true, whatsapp: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil memuat daftar top up', topUps);
});

// PATCH /api/admin/topups/:id
// Proses Top Up (oleh admin)
const processTopUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const topUp = await prisma.topUp.findUnique({ where: { id } });
  if (!topUp) return errorResponse(res, 404, 'Top Up tidak ditemukan');
  if (topUp.status !== 'PENDING') return errorResponse(res, 400, 'Top Up sudah diproses');

  if (action === 'approve') {
    await prisma.$transaction([
      prisma.topUp.update({
        where: { id },
        data: { status: 'APPROVED' }
      }),
      prisma.user.update({
        where: { id: topUp.userId },
        data: { saldo: { increment: topUp.amount } }
      }),
      prisma.notification.create({
        data: {
          userId: topUp.userId,
          title: 'Top Up Berhasil',
          message: `Top Up saldo sebesar Rp ${topUp.amount.toLocaleString('id-ID')} telah disetujui dan ditambahkan ke dompet Anda.`
        }
      })
    ]);

    return successResponse(res, 200, 'Top up berhasil disetujui');
  } else if (action === 'reject') {
    await prisma.$transaction([
      prisma.topUp.update({
        where: { id },
        data: { status: 'REJECTED' }
      }),
      prisma.notification.create({
        data: {
          userId: topUp.userId,
          title: 'Top Up Ditolak',
          message: `Top Up saldo sebesar Rp ${topUp.amount.toLocaleString('id-ID')} ditolak. Silakan periksa kembali bukti transfer Anda.`
        }
      })
    ]);

    return successResponse(res, 200, 'Top up ditolak');
  }

  return errorResponse(res, 400, 'Action tidak valid');
});

module.exports = {
  getWalletInfo,
  requestWithdrawal,
  getPendingWithdrawals,
  processWithdrawal,
  requestTopUp,
  getPendingTopUps,
  processTopUp
};
