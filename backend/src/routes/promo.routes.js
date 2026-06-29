const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public routes
router.get('/active', promoController.getActivePromos);

// Protected routes (User)
router.post('/validate', protect, promoController.validatePromo);

// Admin / Owner routes
router.get('/', protect, restrictTo('ADMIN', 'OWNER'), promoController.getPromos);
router.post('/', protect, restrictTo('ADMIN', 'OWNER'), upload.fields([{ name: 'bannerImage', maxCount: 1 }]), promoController.createPromo);
router.put('/:id', protect, restrictTo('ADMIN', 'OWNER'), upload.fields([{ name: 'bannerImage', maxCount: 1 }]), promoController.updatePromo);
router.delete('/:id', protect, restrictTo('ADMIN', 'OWNER'), promoController.deletePromo);

module.exports = router;
