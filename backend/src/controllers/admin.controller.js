// src/controllers/admin.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  // Hitung user online (aktif dalam 15 menit terakhir)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const [totalUsers, totalItems, activeTransactions, onlineUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'MAHASISWA' } }),
    prisma.item.count(),
    prisma.transaction.count({ where: { status: { in: ['BORROWED', 'APPROVED'] } } }),
    prisma.user.count({ where: { role: 'MAHASISWA', lastActiveAt: { gte: fifteenMinutesAgo } } })
  ]);

  // Hitung total revenue dan average spending dari transaksi COMPLETED
  const completedTransactions = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
    select: { totalPrice: true }
  });

  let totalRevenue = 0;
  let totalSpending = 0;

  completedTransactions.forEach(tx => {
    // Biaya admin tetap Rp5.000 per transaksi
    totalRevenue += 5000;
    totalSpending += tx.totalPrice;
  });

  const averageSpending = completedTransactions.length > 0 
    ? Math.floor(totalSpending / completedTransactions.length) 
    : 0;

  return successResponse(res, 200, 'Berhasil memuat statistik admin', {
    totalUsers,
    onlineUsers,
    totalItems,
    activeTransactions,
    totalRevenue,
    averageSpending
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'MAHASISWA' },
    select: {
      id: true, nama: true, email: true, nim: true, jurusan: true, isSuspended: true, createdAt: true,
      items: {
        select: {
          id: true,
          namaBarang: true,
          statusBarang: true,
          stok: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat daftar pengguna', users);
});

// GET /api/admin/users/unverified
const getUnverifiedUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'MAHASISWA', isVerified: false, ktmUrl: { not: null } },
    select: {
      id: true, nama: true, email: true, nim: true, universitas: true, ktmUrl: true, createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat daftar pengguna belum terverifikasi', users);
});

// PUT /api/admin/users/:id/verify
const verifyUserKtm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan');

  if (status === 'APPROVED') {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: true }
    });
    return successResponse(res, 200, 'Pengguna berhasil diverifikasi', updatedUser);
  } else if (status === 'REJECTED') {
    // Ktm ditolak, hapus url ktm agar user bisa upload ulang
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { ktmUrl: null }
    });
    return successResponse(res, 200, 'KTM ditolak, pengguna harus mengunggah ulang', updatedUser);
  }

  return errorResponse(res, 400, 'Status tidak valid');
});

// PUT /api/admin/users/:id/suspend
const toggleUserSuspend = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan');
  if (user.role === 'ADMIN') return errorResponse(res, 400, 'Tidak bisa men-suspend sesama Admin');

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isSuspended: !user.isSuspended }
  });

  return successResponse(res, 200, `Akun berhasil ${updatedUser.isSuspended ? 'di-suspend' : 'diaktifkan kembali'}`, updatedUser);
});

// GET /api/admin/items
const getItems = asyncHandler(async (req, res) => {
  const items = await prisma.item.findMany({
    include: {
      owner: { select: { nama: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat daftar barang', items);
});

// PUT /api/admin/items/:id/ban
const toggleItemBan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return errorResponse(res, 404, 'Barang tidak ditemukan');

  const updatedItem = await prisma.item.update({
    where: { id },
    data: { isBanned: !item.isBanned }
  });

  return successResponse(res, 200, `Barang berhasil ${updatedItem.isBanned ? 'diblokir' : 'diaktifkan kembali'}`, updatedItem);
});

// GET /api/admin/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      item: { select: { namaBarang: true, owner: { select: { nama: true } } } },
      borrower: { select: { nama: true } },
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat transaksi', transactions);
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUnverifiedUsers,
  verifyUserKtm,
  toggleUserSuspend,
  getItems,
  toggleItemBan,
  getTransactions
};
