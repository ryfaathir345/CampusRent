// src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/multer');
const { 
  uploadPaymentProof, 
  getPendingPayments, 
  verifyPayment,
  getAdminRevenue
} = require('../controllers/payment.controller');

router.get('/revenue', protect, isAdmin, getAdminRevenue);
router.post('/:transactionId', protect, upload.single('buktiPembayaran'), uploadPaymentProof);
router.get('/pending', protect, isAdmin, getPendingPayments);
router.patch('/:id/verify', protect, isAdmin, verifyPayment);

module.exports = router;
