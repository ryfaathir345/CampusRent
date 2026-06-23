// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUnverifiedUsers,
  verifyUserKtm,
  toggleUserSuspend,
  getItems,
  toggleItemBan,
  getTransactions
} = require('../controllers/admin.controller');

// Semua rute admin harus dilindungi dan hanya untuk role ADMIN
router.use(protect, isAdmin);

router.get('/stats', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/unverified', getUnverifiedUsers);
router.put('/users/:id/verify', verifyUserKtm);
router.put('/users/:id/suspend', toggleUserSuspend);
router.get('/items', getItems);
router.put('/items/:id/ban', toggleItemBan);
router.get('/transactions', getTransactions);

module.exports = router;
