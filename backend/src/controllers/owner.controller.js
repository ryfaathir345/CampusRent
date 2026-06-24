// src/controllers/owner.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/owner/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Total Pendapatan (dari transaksi yang COMPLETED)
  const completedTransactions = await prisma.transaction.findMany({
    where: {
      item: { ownerId: userId },
      status: 'COMPLETED'
    }
  });
  const totalRevenue = completedTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);

  // 2. Jumlah Barang Aktif
  const activeItems = await prisma.item.count({
    where: {
      ownerId: userId,
      statusBarang: { in: ['TERSEDIA', 'DIPINJAM'] },
      isBanned: false
    }
  });

  // 3. Total Transaksi Selesai
  const totalCompletedTransactions = completedTransactions.length;

  // 4. Total Views (dari semua barang)
  const items = await prisma.item.findMany({
    where: { ownerId: userId },
    select: { viewCount: true }
  });
  const totalViews = items.reduce((sum, item) => sum + item.viewCount, 0);

  return successResponse(res, 200, 'Berhasil mengambil statistik dashboard', {
    totalRevenue,
    activeItems,
    totalCompletedTransactions,
    totalViews
  });
});

// GET /api/owner/revenue-chart
const getRevenueChart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const currentYear = new Date().getFullYear();

  // Get completed transactions for the current year
  const transactions = await prisma.transaction.findMany({
    where: {
      item: { ownerId: userId },
      status: 'COMPLETED',
      updatedAt: {
        gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
      }
    },
    select: {
      totalPrice: true,
      updatedAt: true
    }
  });

  // Group by month
  const monthlyRevenue = Array(12).fill(0);
  transactions.forEach(tx => {
    const month = tx.updatedAt.getMonth(); // 0-11
    monthlyRevenue[month] += tx.totalPrice;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, index) => ({
    name: month,
    revenue: monthlyRevenue[index]
  }));

  return successResponse(res, 200, 'Berhasil mengambil data grafik pendapatan', chartData);
});

// GET /api/owner/top-items
const getTopItems = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const items = await prisma.item.findMany({
    where: { ownerId: userId },
    include: {
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: [
      { transactions: { _count: 'desc' } },
      { viewCount: 'desc' }
    ],
    take: 5
  });

  const formattedItems = items.map(item => ({
    id: item.id,
    namaBarang: item.namaBarang,
    kategori: item.kategori,
    hargaSewa: item.hargaSewa,
    viewCount: item.viewCount,
    totalTransactions: item._count.transactions,
    statusBarang: item.statusBarang
  }));

  return successResponse(res, 200, 'Berhasil mengambil barang terpopuler', formattedItems);
});

module.exports = {
  getDashboardStats,
  getRevenueChart,
  getTopItems
};
