// src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRequest,
  createInquiry,
  getMyBorrowings,
  getMyItemRequests,
  updateRequestStatus,
  updateBorrowStatus,
  getDashboardStats,
  requestExtension,
  respondExtension,
  payPenalty
} = require('../controllers/transaction.controller');

router.use(protect);

router.get('/stats', getDashboardStats);
router.post('/', createRequest);
router.post('/inquiry', createInquiry);
router.get('/borrowings', getMyBorrowings);
router.get('/requests', getMyItemRequests);
router.patch('/:id/status', updateRequestStatus);
router.patch('/:id/borrow', updateBorrowStatus);

router.post('/:id/extend', requestExtension);
router.patch('/:id/extend/:extendId', respondExtension);
router.post('/:id/pay-penalty', payPenalty);

module.exports = router;
