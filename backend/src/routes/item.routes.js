const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { protect, requireVerified } = require('../middleware/auth');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/item.controller');

// Public routes
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected routes
router.post('/', protect, requireVerified, upload.array('fotoBarang', 5), createItem);
router.patch('/:id', protect, upload.array('fotoBarang', 5), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
