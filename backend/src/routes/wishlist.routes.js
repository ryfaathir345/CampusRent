// src/routes/wishlist.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/wishlist.controller');

router.use(protect);

router.get('/', getWishlist);
router.post('/:itemId', toggleWishlist);

module.exports = router;
