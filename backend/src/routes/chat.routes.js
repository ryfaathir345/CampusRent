// src/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, deleteMessage, markAsRead } = require('../controllers/chat.controller');
const upload = require('../middleware/multer');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:transactionId/messages', getMessages);
router.post('/:transactionId/messages', upload.single('image'), sendMessage);
router.delete('/:transactionId/messages/:messageId', deleteMessage);
router.put('/:transactionId/messages/read', markAsRead);

module.exports = router;
