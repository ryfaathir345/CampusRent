// src/routes/review.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getUserReviews, getItemReviews } = require('../controllers/review.controller');

// GET reviews doesn't need to be protected tightly if it's public profile, but let's just protect it or not.
// We'll keep it public for ItemDetail but we'll protect createReview
router.get('/user/:userId', getUserReviews);
router.get('/item/:itemId', getItemReviews);

router.post('/', protect, createReview);

module.exports = router;
