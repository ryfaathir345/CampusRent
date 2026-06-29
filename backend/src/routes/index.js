// src/routes/index.js
// Main router — aggregates all sub-routes

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const itemRoutes = require('./item.routes');
const transactionRoutes = require('./transaction.routes');
const notificationRoutes = require('./notification.routes');
const chatRoutes = require('./chat.routes');
const profileRoutes = require('./profile.routes');
const reviewRoutes = require('./review.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');
const wishlistRoutes = require('./wishlist.routes');
const reportRoutes = require('./report.routes');
const paymentRoutes = require('./payment.routes');
const walletRoutes = require('./wallet.routes');
const ownerRoutes = require('./owner.routes');
const promoRoutes = require('./promo.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/transactions', transactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/profile', profileRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/wishlists', wishlistRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/owner', ownerRoutes);
router.use('/promos', promoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🎓 Kampus Pinjam API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
