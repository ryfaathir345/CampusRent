// src/routes/owner.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getRevenueChart,
  getTopItems
} = require('../controllers/owner.controller');

// All owner routes are protected
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/top-items', getTopItems);

module.exports = router;
