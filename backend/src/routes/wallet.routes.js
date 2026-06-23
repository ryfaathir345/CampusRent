// src/routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { 
  getWalletInfo, 
  requestWithdrawal,
  getPendingWithdrawals,
  processWithdrawal
} = require('../controllers/wallet.controller');

router.get('/', protect, getWalletInfo);
router.post('/withdraw', protect, requestWithdrawal);

// Admin routes for wallet withdrawals
router.get('/withdrawals/pending', protect, isAdmin, getPendingWithdrawals);
router.patch('/withdrawals/:id', protect, isAdmin, processWithdrawal);

module.exports = router;
