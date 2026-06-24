// src/routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { 
  getWalletInfo, 
  requestWithdrawal,
  getPendingWithdrawals,
  processWithdrawal,
  requestTopUp,
  getPendingTopUps,
  processTopUp
} = require('../controllers/wallet.controller');
const upload = require('../middleware/multer');

router.get('/', protect, getWalletInfo);
router.post('/withdraw', protect, requestWithdrawal);
router.post('/topup', protect, upload.single('bukti'), requestTopUp);

// Admin routes for wallet withdrawals & topups
router.get('/withdrawals/pending', protect, isAdmin, getPendingWithdrawals);
router.patch('/withdrawals/:id', protect, isAdmin, processWithdrawal);
router.get('/topups/pending', protect, isAdmin, getPendingTopUps);
router.patch('/topups/:id', protect, isAdmin, processTopUp);

module.exports = router;
