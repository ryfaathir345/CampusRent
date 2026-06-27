// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin, isOwner } = require('../middleware/auth');
const {
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
} = require('../controllers/admin.controller');

// Semua rute admin harus dilindungi dan hanya untuk role ADMIN
router.use(protect, isAdmin);

router.get('/stats', getDashboardStats);

// Dashboard widgets
// Dashboard widgets
router.get('/dashboard/monthly-target', getMonthlyTarget);
router.put('/dashboard/monthly-target', setMonthlyTarget);
router.get('/dashboard/monthly-sales', getMonthlySales);
router.get('/dashboard/daily-stats', getDailyStats);
router.get('/dashboard/recent-transactions', getRecentTransactions);
router.get('/dashboard/demographic', getDemographic);

router.get('/users', getUsers);
router.get('/users/unverified', getUnverifiedUsers);
router.put('/users/verify-all', verifyAllKtm);
router.put('/users/:id/verify', verifyUserKtm);
router.put('/users/:id/suspend', toggleUserSuspend);
router.put('/users/:id/role', isOwner, updateUserRole);
router.get('/items', getItems);
router.put('/items/:id/ban', toggleItemBan);
router.delete('/items/:id', deleteItem);
router.get('/transactions', getTransactions);

module.exports = router;

