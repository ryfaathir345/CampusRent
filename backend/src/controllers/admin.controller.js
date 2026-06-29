// src/controllers/admin.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  // Hitung user online (aktif dalam 15 menit terakhir)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const [totalUsers, totalItems, activeItems, onlineUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'MAHASISWA' } }),
    prisma.item.count(),
    prisma.item.count({ where: { statusBarang: 'TERSEDIA', isBanned: false } }),
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
    activeItems,
    totalRevenue,
    averageSpending
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: { in: ['MAHASISWA', 'ADMIN'] } },
    select: {
      id: true, nama: true, email: true, nim: true, jurusan: true, isSuspended: true, isVerified: true, createdAt: true, role: true,
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

// PUT /api/admin/users/verify-all
const verifyAllKtm = asyncHandler(async (req, res) => {
  const result = await prisma.user.updateMany({
    where: { 
      role: 'MAHASISWA', 
      isVerified: false, 
      ktmUrl: { not: null } 
    },
    data: { isVerified: true }
  });

  return successResponse(res, 200, `${result.count} pengguna berhasil diverifikasi secara massal`);
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

// PUT /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['ADMIN', 'MAHASISWA', 'OWNER'].includes(role)) {
     return errorResponse(res, 400, 'Role tidak valid');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return errorResponse(res, 404, 'Pengguna tidak ditemukan');

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role }
  });

  return successResponse(res, 200, `Role pengguna berhasil diubah menjadi ${role}`, updatedUser);
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

// DELETE /api/admin/items/:id
const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return errorResponse(res, 404, 'Barang tidak ditemukan');

  await prisma.item.delete({ where: { id } });

  return successResponse(res, 200, 'Barang berhasil dihapus secara permanen beserta data terkait.');
});

// GET /api/admin/dashboard/monthly-target
const getMonthlyTarget = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const completedThisMonth = await prisma.transaction.count({
    where: { status: 'COMPLETED', updatedAt: { gte: startOfMonth, lte: endOfMonth } }
  });

  const setting = await prisma.appSetting.findUnique({ where: { key: 'monthly_target_revenue' } });
  const TARGET_REVENUE = setting ? parseInt(setting.value) : 1000000;
  const ADMIN_FEE = 5000;
  const TARGET_COUNT = Math.ceil(TARGET_REVENUE / ADMIN_FEE);

  const revenueThisMonth = completedThisMonth * ADMIN_FEE;
  const percentage = Math.min(Math.round((completedThisMonth / TARGET_COUNT) * 100), 100);

  return successResponse(res, 200, 'Monthly target berhasil dimuat', {
    completedThisMonth,
    targetCount: TARGET_COUNT,
    revenueThisMonth,
    targetRevenue: TARGET_REVENUE,
    percentage,
    adminFee: ADMIN_FEE
  });
});

// PUT /api/admin/dashboard/monthly-target
const setMonthlyTarget = asyncHandler(async (req, res) => {
  const { targetRevenue } = req.body;
  if (!targetRevenue || isNaN(targetRevenue)) return errorResponse(res, 400, 'Target revenue harus berupa angka yang valid');

  await prisma.appSetting.upsert({
    where: { key: 'monthly_target_revenue' },
    update: { value: targetRevenue.toString() },
    create: { key: 'monthly_target_revenue', value: targetRevenue.toString() }
  });
  
  return successResponse(res, 200, 'Target bulanan berhasil diupdate');
});

// GET /api/admin/dashboard/monthly-sales
const getMonthlySales = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Ambil semua transaksi COMPLETED tahun ini
  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31T23:59:59`) }
    },
    select: { updatedAt: true, totalPrice: true }
  });

  // Group by bulan
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleString('en-US', { month: 'short' }),
    monthIndex: i,
    revenue: 0,
    transactionCount: 0
  }));

  transactions.forEach(tx => {
    const monthIdx = new Date(tx.updatedAt).getMonth();
    monthlyData[monthIdx].transactionCount += 1;
    monthlyData[monthIdx].revenue += 5000; // Admin fee per transaksi
  });

  return successResponse(res, 200, 'Monthly sales berhasil dimuat', monthlyData);
});

// GET /api/admin/dashboard/daily-stats?days=30 OR ?startDate=...&endDate=...
const getDailyStats = asyncHandler(async (req, res) => {
  let start = new Date();
  let end = new Date();

  if (req.query.startDate && req.query.endDate) {
    start = new Date(req.query.startDate);
    end = new Date(req.query.endDate);
  } else {
    const days = parseInt(req.query.days) || 30;
    start.setDate(start.getDate() - (days - 1));
  }

  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  const result = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

    const count = await prisma.transaction.count({
      where: { status: 'COMPLETED', updatedAt: { gte: startOfDay, lte: endOfDay } }
    });

    result.push({
      date: startOfDay.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      revenue: count * 5000,
      transactionCount: count
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return successResponse(res, 200, 'Daily stats berhasil dimuat', result);
});

// GET /api/admin/dashboard/recent-transactions?limit=5
const getRecentTransactions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const transactions = await prisma.transaction.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        select: { namaBarang: true, fotoBarang: true, kategori: true }
      },
      borrower: {
        select: { nama: true, jurusan: true }
      },
      payment: {
        select: { status: true }
      }
    }
  });

  return successResponse(res, 200, 'Recent transactions berhasil dimuat', transactions);
});

// GET /api/admin/dashboard/demographic
const getDemographic = asyncHandler(async (req, res) => {
  // Ambil distribusi jurusan dari user yang memiliki item aktif
  const users = await prisma.user.findMany({
    where: { role: 'MAHASISWA', items: { some: {} } },
    select: { jurusan: true }
  });

  const jurusanCount = {};
  users.forEach(u => {
    const j = u.jurusan || 'Tidak Diketahui';
    jurusanCount[j] = (jurusanCount[j] || 0) + 1;
  });

  const total = users.length || 1;
  const sorted = Object.entries(jurusanCount)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return successResponse(res, 200, 'Demographic berhasil dimuat', { items: sorted, total });
});

module.exports = {
  getDashboardStats,
  getMonthlyTarget,
  setMonthlyTarget,
  getMonthlySales,
  getDailyStats,
  getRecentTransactions,
  getDemographic,
  getUsers,
  getUnverifiedUsers,
  verifyAllKtm,
  verifyUserKtm,
  toggleUserSuspend,
  updateUserRole,
  getItems,
  toggleItemBan,
  getTransactions,
  deleteItem
};

