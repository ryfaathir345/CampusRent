const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  deleteCategory
} = require('../controllers/category.controller');

// Public route to get categories
router.get('/', getCategories);

// Admin only routes for managing categories
router.post('/', protect, isAdmin, createCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;
